# Exemplos de Refatoração - Antes e Depois

## Exemplo 1: Conditional Expect (Try/Catch)

### ❌ ANTES (Smelly)
```javascript
test('deve falhar ao criar usuário menor de idade', () => {
  // Este teste não falha se a exceção NÃO for lançada.
  // Ele só passa se o `catch` for executado. Se a lógica de validação
  // for removida, o teste passa silenciosamente, escondendo um bug.
  try {
    userService.createUser('Menor', 'menor@email.com', 17);
  } catch (e) {
    expect(e.message).toBe('O usuário deve ser maior de idade.');
  }
});
```

**Problemas:**
- ✗ `expect` dentro de `catch` (condicional)
- ✗ Se a exceção não for lançada, o teste passa sem fazer nenhuma verificação
- ✗ ESLint Error: `jest/no-conditional-expect`

### ✅ DEPOIS (Clean)
```javascript
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
```

**Melhorias:**
- ✓ Sem lógica condicional
- ✓ Se a exceção não for lançada, o teste FALHA corretamente
- ✓ Padrão AAA aplicado
- ✓ ESLint passa sem erros

---

## Exemplo 2: Eager Test + Conditional Expect

### ❌ ANTES (Smelly)
```javascript
test('deve desativar usuários se eles não forem administradores', () => {
  const usuarioComum = userService.createUser('Comum', 'comum@teste.com', 30);
  const usuarioAdmin = userService.createUser('Admin', 'admin@teste.com', 40, true);

  const todosOsUsuarios = [usuarioComum, usuarioAdmin];

  // O teste tem um loop e um if, tornando-o complexo e menos claro.
  for (const user of todosOsUsuarios) {
    const resultado = userService.deactivateUser(user.id);
    if (!user.isAdmin) {
      // Este expect só roda para o usuário comum.
      expect(resultado).toBe(true);
      const usuarioAtualizado = userService.getUserById(user.id);
      expect(usuarioAtualizado.status).toBe('inativo');
    } else {
      // E este só roda para o admin.
      expect(resultado).toBe(false);
    }
  }
});
```

**Problemas:**
- ✗ Loop `for` no teste
- ✗ Condicional `if/else`
- ✗ `expect` condicional (3 ocorrências)
- ✗ Testa múltiplos cenários em um único teste (Eager Test)
- ✗ Difícil saber qual cenário falhou
- ✗ ESLint Error: `jest/no-conditional-expect` (3x)

### ✅ DEPOIS (Clean)
```javascript
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
});
```

**Melhorias:**
- ✓ Sem loops ou condicionais
- ✓ Dois testes separados e focados
- ✓ Cada teste verifica um único cenário
- ✓ Falhas apontam exatamente o problema
- ✓ Padrão AAA em ambos
- ✓ Agrupados logicamente com `describe`
- ✓ ESLint passa sem erros

---

## Exemplo 3: Fragile Test

### ❌ ANTES (Smelly)
```javascript
test('deve gerar um relatório de usuários formatado', () => {
  const usuario1 = userService.createUser('Alice', 'alice@email.com', 28);
  userService.createUser('Bob', 'bob@email.com', 32);

  const relatorio = userService.generateUserReport();
  
  // Se a formatação mudar (ex: adicionar um espaço, mudar a ordem), o teste quebra.
  const linhaEsperada = `ID: ${usuario1.id}, Nome: Alice, Status: ativo\n`;
  expect(relatorio).toContain(linhaEsperada);
  expect(relatorio.startsWith('--- Relatório de Usuários ---')).toBe(true);
});
```

**Problemas:**
- ✗ Acoplado aos detalhes de formatação
- ✗ Quebra se adicionar/remover espaços
- ✗ Quebra se mudar ordem dos campos
- ✗ Testa implementação, não comportamento
- ✗ Difícil de manter

### ✅ DEPOIS (Clean)
```javascript
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
```

**Melhorias:**
- ✓ Testa comportamento, não formatação
- ✓ Resistente a mudanças de formatação
- ✓ Três testes separados para cenários diferentes
- ✓ Mais fácil de entender e manter
- ✓ Regex para padrões flexíveis
- ✓ Cada teste com responsabilidade única

---

## Resumo das Transformações

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Testes** | 5 testes (1 skip) | 11 testes completos |
| **Lógica** | Loops, if/else, try/catch | Zero lógica condicional |
| **Organização** | Plana | 4 grupos `describe()` |
| **ESLint** | 6 problemas | 0 problemas |
| **AAA** | Parcialmente aplicado | 100% aplicado |
| **Manutenibilidade** | Baixa | Alta |
| **Clareza** | Confusa | Cristalina |

---

## Princípios Aplicados

### 1. **Um Teste, Uma Responsabilidade**
Cada teste verifica um único comportamento específico.

### 2. **Sem Lógica em Testes**
Testes são dados, não algoritmos. Sem loops, condicionais ou cálculos.

### 3. **AAA Sempre**
Arrange (preparar) → Act (agir) → Assert (verificar)

### 4. **Comportamento, Não Implementação**
Testes devem verificar O QUE o código faz, não COMO ele faz.

### 5. **Nomes Auto-Documentados**
O nome do teste deve descrever completamente o cenário e resultado esperado.

### 6. **Falhas Claras**
Quando um teste falha, deve ser óbvio qual comportamento está quebrado.
