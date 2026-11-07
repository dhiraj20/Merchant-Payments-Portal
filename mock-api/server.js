const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./mock-api/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Auth: POST /api/auth/login
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ email, password }).value();

  if (user) {
    const token = `${user.role.toLowerCase()}-token-${Date.now()}`;
    const refreshToken = `${user.role.toLowerCase()}-refresh-${Date.now()}`;

    // Update token in db
    db.get('users').find({ id: user.id }).assign({ token, refreshToken }).write();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
      refreshToken,
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Auth: POST /api/auth/refresh
server.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  const db = router.db;
  const user = db.get('users').find({ refreshToken }).value();

  if (user) {
    const newToken = `${user.role.toLowerCase()}-token-${Date.now()}`;
    const newRefresh = `${user.role.toLowerCase()}-refresh-${Date.now()}`;
    db.get('users').find({ id: user.id }).assign({ token: newToken, refreshToken: newRefresh }).write();
    res.json({ token: newToken, refreshToken: newRefresh });
  } else {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Paginated applications
server.get('/api/applications', (req, res) => {
  const db = router.db;
  let apps = db.get('applications').value();

  const { status, businessName_like, _page = 1, _per_page = 10 } = req.query;

  if (status) apps = apps.filter(a => a.status === status);
  if (businessName_like) {
    apps = apps.filter(a =>
      a.businessName.toLowerCase().includes(businessName_like.toLowerCase())
    );
  }

  const total = apps.length;
  const page = parseInt(_page, 10) - 1;
  const pageSize = parseInt(_per_page, 10);
  const data = apps.slice(page * pageSize, (page + 1) * pageSize);

  res.json({ data, total, page, pageSize });
});

// Individual application CRUD — route to json-server
server.use('/api', router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Mock API running at http://localhost:${PORT}`);
  console.log('  POST /api/auth/login');
  console.log('  POST /api/auth/refresh');
  console.log('  GET  /api/applications');
  console.log('  GET  /api/applications/:id');
  console.log('  POST /api/applications');
  console.log('  PATCH /api/applications/:id');
  console.log('  GET  /api/risk_decisions');
  console.log('  POST /api/risk_decisions');
});
