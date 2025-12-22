const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // 需要安装: npm install bcryptjs
const Adopter = require('../models/adopter');
const Pet = require('../models/pet');
const Shelter = require('../models/shelter');

// ============================================
// 1. 注册新用户 (Register)
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, phone } = req.body;

    // 检查用户是否已存在
    const existingUser = await Adopter.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }

    // 🔒 加密密码 (重要!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newAdopter = new Adopter({
      username,
      email,
      password: hashedPassword, // 存储加密后的密码
      fullName,
      phone
    });

    await newAdopter.save();

    res.json({ 
      success: true, 
      message: 'Registration successful!' 
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// ============================================
// 2. 用户登录 (Login)
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const adopter = await Adopter.findOne({ email });
    
    if (!adopter) {
      return res.json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // 🔒 验证密码
    const isPasswordValid = await bcrypt.compare(password, adopter.password);
    
    if (!isPasswordValid) {
      return res.json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // 返回用户信息 (不包含密码)
    const adopterData = {
      id: adopter._id,
      username: adopter.username,
      email: adopter.email,
      fullName: adopter.fullName,
      phone: adopter.phone,
      preferences: adopter.preferences
    };

    res.json({ 
      success: true, 
      message: 'Login successful',
      adopter: adopterData,
      adopterId: adopter._id 
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// ============================================
// 3. 获取所有可领养的宠物 (Browse Pets)
// ============================================
router.get('/pets/all', async (req, res) => {
  try {
    const pets = await Pet.find({ adoptionStatus: 'Available' })
      .populate('shelterId', 'name location phone email') // 填充 shelter 信息
      .sort({ createdAt: -1 }); // 最新的在前

    res.json({ 
      success: true, 
      pets 
    });
  } catch (error) {
    console.error('Fetch Pets Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pets' 
    });
  }
});

// ============================================
// 4. AI 智能匹配宠物 (AI Matching)
// ============================================
router.post('/pets/match', async (req, res) => {
  try {
    const { adopterId } = req.body;

    // 获取用户偏好
    const adopter = await Adopter.findById(adopterId);
    if (!adopter) {
      return res.json({ success: false, message: 'Adopter not found' });
    }

    const prefs = adopter.preferences;

    // 获取所有可领养的宠物
    const allPets = await Pet.find({ adoptionStatus: 'Available' })
      .populate('shelterId', 'name location phone email');

    // 🤖 计算匹配分数
    const petsWithScores = allPets.map(pet => {
      let score = 0;
      let maxScore = 0;

      // 1. 大小匹配 (30分)
      maxScore += 30;
      if (prefs.preferredSize.includes(pet.size)) {
        score += 30;
      }

      // 2. 性格匹配 (40分)
      maxScore += 40;
      const matchingTemperaments = pet.labels.temperament.filter(t => 
        prefs.preferredTemperament.includes(t)
      );
      score += (matchingTemperaments.length / Math.max(prefs.preferredTemperament.length, 1)) * 40;

      // 3. 生活环境匹配 (30分)
      maxScore += 30;
      
      // 如果宠物适合儿童且用户有儿童 (+10分)
      if (prefs.hasChildren && pet.labels.goodWith.includes('Children')) {
        score += 10;
      }
      
      // 如果宠物适合其他宠物且用户有宠物 (+10分)
      if (prefs.hasOtherPets && pet.labels.goodWith.includes('Other Dogs')) {
        score += 10;
      }

      // 大型犬需要花园 (+10分)
      if (pet.size === 'Large' && prefs.hasGarden) {
        score += 10;
      }

      // 计算百分比
      const compatibilityScore = Math.round((score / maxScore) * 100);

      return {
        ...pet.toObject(),
        compatibilityScore
      };
    });

    // 按分数降序排列
    petsWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({ 
      success: true, 
      pets: petsWithScores 
    });
  } catch (error) {
    console.error('AI Matching Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI matching failed' 
    });
  }
});

// ============================================
// 5. 提交领养申请 (Submit Adoption Request)
// ============================================
router.post('/:adopterId/request', async (req, res) => {
  try {
    const { adopterId } = req.params;
    const { petId } = req.body;

    // 检查是否已经提交过
    const adopter = await Adopter.findById(adopterId);
    const existingRequest = adopter.adoptionRequests.find(
      req => req.petId.toString() === petId && req.status === 'Pending'
    );

    if (existingRequest) {
      return res.json({ 
        success: false, 
        message: 'You have already submitted a request for this pet' 
      });
    }

    // 添加新请求
    adopter.adoptionRequests.push({
      petId,
      status: 'Pending',
      requestDate: new Date()
    });

    await adopter.save();

    res.json({ 
      success: true, 
      message: 'Adoption request submitted!' 
    });
  } catch (error) {
    console.error('Submit Request Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit request' 
    });
  }
});

// ============================================
// 6. 取消领养申请 (Cancel Request)
// ============================================
router.delete('/:adopterId/request/:petId', async (req, res) => {
  try {
    const { adopterId, petId } = req.params;

    const adopter = await Adopter.findById(adopterId);
    
    // 移除请求
    adopter.adoptionRequests = adopter.adoptionRequests.filter(
      req => req.petId.toString() !== petId
    );

    await adopter.save();

    res.json({ 
      success: true, 
      message: 'Request cancelled' 
    });
  } catch (error) {
    console.error('Cancel Request Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel request' 
    });
  }
});

// ============================================
// 7. 获取用户的所有请求 (My Requests)
// ============================================
router.get('/:adopterId/requests', async (req, res) => {
  try {
    const { adopterId } = req.params;

    const adopter = await Adopter.findById(adopterId)
      .populate('adoptionRequests.petId'); // 填充宠物信息

    res.json({ 
      success: true, 
      requests: adopter.adoptionRequests 
    });
  } catch (error) {
    console.error('Fetch Requests Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch requests' 
    });
  }
});

// ============================================
// 8. 获取用户资料 (Profile)
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const adopter = await Adopter.findById(req.params.id)
      .populate('adoptedPets.petId') // 填充已领养的宠物
      .populate('adoptionRequests.petId'); // 填充申请中的宠物

    if (!adopter) {
      return res.json({ success: false, message: 'Adopter not found' });
    }

    res.json({ 
      success: true, 
      adopter: adopter,
      adoptedPets: adopter.adoptedPets,
      adoptionRequests: adopter.adoptionRequests
    });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// ============================================
// 9. 更新用户资料 (Update Profile)
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { fullName, phone, address, preferences } = req.body;

    const updatedAdopter = await Adopter.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        phone,
        address,
        preferences,
        updatedAt: new Date()
      },
      { new: true } // 返回更新后的文档
    );

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      adopter: updatedAdopter 
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

module.exports = router;