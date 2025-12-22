const mongoose = require('mongoose');

/**
 * 改进的 Pet Schema
 * 添加了健康状态、疫苗记录等 Module 4 需要的字段
 */
const petSchema = new mongoose.Schema({
  // === 基本信息 ===
  name: { 
    type: String, 
    required: true,
    trim: true
  },

  species: { 
    type: String, 
    enum: ['Dog', 'Cat'], 
    required: true 
  },

  breed: {
    type: String,
    trim: true
  },

  gender: { 
    type: String, 
    enum: ['Male', 'Female'],
    required: true
  },

  age: { 
    years: { 
      type: Number, 
      min: 0,
      default: 0
    }, 
    months: { 
      type: Number, 
      min: 0, 
      max: 11,
      default: 0
    } 
  },

  size: { 
    type: String, 
    enum: ['Small', 'Medium', 'Large'],
    required: true
  },

  // === 所属 Shelter ===
  shelterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shelter',
    required: true
  },

  // === 图片 ===
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String
  }],

  // === AI 标签 (用于匹配算法) ===
  labels: {
    temperament: {
      type: [String],
      enum: ['Calm', 'Playful', 'Energetic', 'Friendly', 'Independent'],
      default: []
    },
    goodWith: {
      type: [String],
      enum: ['Children', 'Other Dogs', 'Other Cats', 'Elderly', 'Single Adults'],
      default: []
    }
  },

  // === 健康状态 (Module 4 需要) ===
  healthStatus: {
    vaccinated: {
      type: Boolean,
      default: false
    },
    neutered: {
      type: Boolean,
      default: false
    },
    medicalConditions: {
      type: [String],
      default: []
    },
    lastVetVisit: Date,
    nextVaccinationDue: Date
  },

  // === 疫苗记录 (Module 4 - Post Adoption) ===
  vaccinationHistory: [{
    vaccineName: String,
    dateAdministered: Date,
    nextDue: Date,
    veterinarian: String
  }],

  // === 领养状态 ===
  adoptionStatus: { 
    type: String, 
    enum: ['Available', 'Pending', 'Adopted'],
    default: 'Available' 
  },

  // 如果被领养，记录领养者信息
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Adopter'
  },
  
  adoptionDate: Date,

  // === 描述 ===
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  // === 特殊需求 ===
  specialNeeds: {
    type: String,
    trim: true
  },

  // === 行为备注 (Shelter内部使用) ===
  behaviorNotes: {
    type: String,
    trim: true
  }

}, { 
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// ============================================
// 索引优化 (提升查询速度)
// ============================================
petSchema.index({ adoptionStatus: 1 });
petSchema.index({ species: 1, size: 1 });
petSchema.index({ shelterId: 1 });

// ============================================
// 虚拟字段：计算宠物的完整年龄
// ============================================
petSchema.virtual('fullAge').get(function() {
  const years = this.age.years || 0;
  const months = this.age.months || 0;
  
  if (years === 0) return `${months} months old`;
  if (months === 0) return `${years} years old`;
  return `${years} years ${months} months old`;
});

// ============================================
// 方法：检查是否需要疫苗提醒
// ============================================
petSchema.methods.needsVaccinationReminder = function() {
  if (!this.healthStatus.nextVaccinationDue) return false;
  
  const today = new Date();
  const dueDate = new Date(this.healthStatus.nextVaccinationDue);
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
  
  // 如果在 7 天内到期，返回 true
  return daysUntilDue <= 7 && daysUntilDue >= 0;
};

// ============================================
// 方法：获取宠物的简要信息 (用于列表显示)
// ============================================
petSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    species: this.species,
    breed: this.breed,
    size: this.size,
    age: this.fullAge,
    image: this.images[0]?.url,
    status: this.adoptionStatus,
    temperament: this.labels.temperament
  };
};

module.exports = mongoose.model('Pet', petSchema);