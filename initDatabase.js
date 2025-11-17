require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✔ Connected to MongoDB'))
  .catch(err => {
    console.error(' Connection error:', err);
    process.exit(1);
  });

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  approved: Boolean,
  phone: String,
  createdAt: Date
});

const User = mongoose.model('User', UserSchema);

async function initDB() {
  try {
    console.log(' Initializing database...');
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'mustafa@vu.edu.pk' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Mustafa Ahmed',
        email: 'mustafa@vu.edu.pk',
        password: hashedPassword,
        role: 'admin',
        approved: true,
        phone: '+92-XXX-XXXXXXX',
        createdAt: new Date()
      });
      await admin.save();
      console.log(' Admin created');
      console.log('   Email: mustafa@vu.edu.pk');
      console.log('   Password: admin123');
      console.log('     CHANGE PASSWORD AFTER LOGIN!');
    } else {
      console.log(' Admin already exists');
    }
    
    console.log('\n Database initialization complete!');
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

initDB();