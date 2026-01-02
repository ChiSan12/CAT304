const mongoose = require('mongoose');

/**
 * ChatHistory Schema
 * -------------------
 * This schema stores the conversational memory for the chatbot.
 * Each document represents the chat history of a single user.
 * The stored messages are later provided to the AI model
 * to enable context-aware and coherent responses.
 */

const chatHistorySchema = new mongoose.Schema({

    /**
   * Reference to the authenticated adopter (logged-in user).
   * Used for persistent, user-based conversational memory.
   */

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Adopter',
    required: false
  },

  /**
   * Temporary session identifier for guest users.
   * Used when the user is not logged in.
   */
  sessionId: {
    type: String,
    index: true
  },


  /**
   * Array of chat messages exchanged between the user and the AI assistant
   * - role: indicates whether the message is from the user or the assistant
   * - content: the text content of the message
   */
  messages: [
    {
      role: {
        type: String,
        enum: ['user', 'model'],
        required: true
      },
      content: {
        type: String,
        required: true
      }
    }
  ]
  // Automatically adds createdAt and updatedAt timestamps
}, { timestamps: true });


// Export ChatHistory model
// The corresponding MongoDB collection will be created automatically
// when a document is first saved.
module.exports = mongoose.model('ChatHistory', chatHistorySchema);
