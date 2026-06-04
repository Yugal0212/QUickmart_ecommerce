const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const result = await db.collection('products').updateMany(
      { approvalStatus: { $ne: 'approved' } },
      { $set: { approvalStatus: 'approved' } }
    );
    console.log('Approved products count updated:', result.modifiedCount);
    mongoose.disconnect();
  });
