const { UserService } = require('../src/userService');

describe('UserService - Clean Tests', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  // Test 1: Separated creation and retrieval tests following AAA pattern
  describe('createUser', () => {
    test('should create a user with valid data', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;

      // Act
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Assert
      expect(usuarioCriado).toBeDefined();
      expect(usuarioCriado.id).toBeDefined();
      expect(usuarioCriado.nome).toBe(nome);
      expect(usuarioCriado.email).toBe(email);
      expect(usuarioCriado.idade).toBe(idade);
      expect(usuarioCriado.status).toBe('ativo');
      expect(usuarioCriado.createdAt).toBeInstanceOf(Date);
    });

    test('should throw error when creating user with missing required fields', () => {
      // Arrange
      const nome = '';
      const email = 'test@test.com';
      const idade = 25;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow('Nome, email e idade são obrigatórios.');
    });

    test('should throw error when creating user under 18 years old', () => {
      // Arrange
      const nome = 'Menor';
      const email = 'menor@email.com';
      const idade = 17;

      // Act & Assert
      expect(() => {
        userService.createUser(nome, email, idade);
      }).toThrow('O usuário deve ser maior de idade.');
    });
  });

  describe('getUserById', () => {
    test('should retrieve an existing user by id', () => {
      // Arrange
      const nome = 'Fulano de Tal';
      const email = 'fulano@teste.com';
      const idade = 25;
      const usuarioCriado = userService.createUser(nome, email, idade);

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toBeDefined();
      expect(usuarioBuscado.nome).toBe(nome);
      expect(usuarioBuscado.email).toBe(email);
      expect(usuarioBuscado.status).toBe('ativo');
    });

    test('should return null for non-existent user id', () => {
      // Arrange
      const idInvalido = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInvalido);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  // Test 2: Separated deactivation tests - no loops or conditionals
  describe('deactivateUser', () => {
    test('should deactivate a regular user successfully', () => {
      // Arrange
      const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
      const usuarioAtualizado = userService.getUserById(usuarioComum.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    });

    test('should not deactivate an admin user', () => {
      // Arrange
      const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
      const usuarioAtualizado = userService.getUserById(usuarioAdmin.id);
      expect(usuarioAtualizado.status).toBe('ativo');
    });

    test('should return false when deactivating non-existent user', () => {
      // Arrange
      const idInvalido = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInvalido);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  // Test 3: Report generation tests - testing behavior, not implementation details
  describe('generateUserReport', () => {
    test('should generate report with user information when users exist', () => {
      // Arrange
      userService.createUser('Alice', 'alice@email.com', 28);
      userService.createUser('Bob', 'bob@email.com', 32);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert - Verify behavior, not exact formatting
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain('ativo');
      expect(relatorio).toMatch(/Relatório de Usuários/);
    });

    test('should generate report indicating no users when database is empty', () => {
      // Arrange - database is already empty from beforeEach

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado');
    });

    test('should include user status in the report', () => {
      // Arrange
      const usuario = userService.createUser('TestUser', 'test@email.com', 25);
      userService.deactivateUser(usuario.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('inativo');
    });
  });
});
