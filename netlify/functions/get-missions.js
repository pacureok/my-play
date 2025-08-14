const mongoose = require('mongoose');
const Mission = require('../../backend/src/models/Mission');
const User = require('../../backend/src/models/User');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Conexión a la base de datos (con variable de entorno)
    await mongoose.connect(process.env.MONGODB_URI);
    
    const { username } = event.queryStringParameters;
    const user = await User.findOne({ username });

    if (!user) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Usuario no encontrado' }) };
    }

    const missions = await Mission.find({ user: user._id, isCompleted: false });
    
    if (missions.length === 0) {
      const newMission = new Mission({
        title: 'Gana una partida de UNO',
        description: 'Gana cualquier partida de UNO para completar esta misión.',
        reward: 50,
        user: user._id,
      });
      await newMission.save();
      return { statusCode: 200, body: JSON.stringify([newMission]) };
    }
    
    return { statusCode: 200, body: JSON.stringify(missions) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
