/**
 * Data Integrity Verification Script
 * 
 * Checks if user data exists in MongoDB and is retrievable
 * Helps diagnose data loss issues
 */

const mongoose = require('mongoose')
const connectDB = require('../backend/db')
const User = require('../backend/models/User')
const Note = require('../backend/models/Note')
const Project = require('../backend/models/Project')
const Task = require('../backend/models/Task')
const Goal = require('../backend/models/Goal')

async function verifyDataIntegrity() {
  try {
    await connectDB()
    console.log('\n✅ Connected to MongoDB\n')

    // Get all users
    const users = await User.find().select('_id email name')
    console.log(`📊 Total Users: ${users.length}\n`)

    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`)
      console.log(`   ID: ${user._id}`)

      // Count notes
      const notesCount = await Note.countDocuments({ userId: user._id })
      console.log(`   📝 Notes: ${notesCount}`)

      // Count projects
      const projectsCount = await Project.countDocuments({ userId: user._id })
      console.log(`   📁 Projects: ${projectsCount}`)

      // Count tasks
      const tasksCount = await Task.countDocuments({ userId: user._id })
      console.log(`   ✓ Tasks: ${tasksCount}`)

      // Count goals
      const goalsCount = await Goal.countDocuments({ userId: user._id })
      console.log(`   🎯 Goals: ${goalsCount}`)

      // Check for ID mismatches (data with wrong user ID)
      const stringIdNotes = await Note.countDocuments({
        userId: { $type: 'string', $eq: user._id.toString() }
      })

      if (stringIdNotes > 0) {
        console.log(`   WARNING: ${stringIdNotes} notes have string userId instead of ObjectId`)
      }

      // Total data points
      const total = notesCount + projectsCount + tasksCount + goalsCount
      if (total === 0) {
        console.log(`   🔴 NO DATA FOUND!`)
      } else {
        console.log(`   ✅ Total Data Points: ${total}`)
      }
    }

    console.log('\n✅ Verification Complete\n')
    process.exit(0)
  } catch (error) {
    console.error('❌ Verification Failed:', error.message)
    process.exit(1)
  }
}

verifyDataIntegrity()
