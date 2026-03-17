require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const familyMemberRoutes = require('./routes/familyMembers');
const outreachRoutes = require('./routes/outreach');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/patients/:patientId/family', familyMemberRoutes);
app.use('/api/family/:memberId/outreach', outreachRoutes);
app.use('/api/stats', statsRoutes);

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  service: 'Lineage AI API',
  version: '2.0.0',
  timestamp: new Date().toISOString(),
}));

app.listen(PORT, () => {
  console.log(`Lineage AI backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
