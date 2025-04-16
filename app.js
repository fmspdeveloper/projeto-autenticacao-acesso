const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const app = express();

// Configuração do EJS para templates
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

// Configuração da sessão
app.use(session({
  secret: 'segredoSuperSecreto',
  resave: false,
  saveUninitialized: false
}));

// Inicializa o Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Simulação de um "banco de dados" de usuários
const users = [
  {
    id: 1,
    username: 'usuario',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4HkJXpQYgXjq9W8nL.6XJQGqF/KO' // "senha123" criptografada
  }
];

// Configuração da estratégia local do Passport
passport.use(new LocalStrategy(
  (username, password, done) => {
    const user = users.find(u => u.username === username);
    if (!user) return done(null, false, {message: 'Usuário não encontrado.'});

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) return done(null, user);
      else return done(null, false, {message: 'Senha incorreta.'});
    });
  }
));

// Serialização do usuário para a sessão
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Desserialização do usuário
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Rotas
app.get('/', (req, res) => {
  res.send(req.isAuthenticated() ? `Olá, ${req.user.username}! <a href="/logout">Sair</a>` : '<a href="/login">Login</a>');
});

app.get('/login', (req, res) => {
  res.render('login', {message: req.flash('error')}); // Requer pacote `connect-flash` para mensagens
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true // Requer `connect-flash`
  })
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
