const delay = (ms) => new Promise((r) => setTimeout(r, ms));

let users = [
  { id: 1, name: 'Alice Johnson',  email: 'alice@acme.com',  role: 'Admin',   dept: 'Engineering' },
  { id: 2, name: 'Bob Smith',      email: 'bob@acme.com',    role: 'User',    dept: 'Marketing'   },
  { id: 3, name: 'Carol White',    email: 'carol@acme.com',  role: 'Manager', dept: 'Product'     },
  { id: 4, name: 'David Chen',     email: 'david@acme.com',  role: 'User',    dept: 'Design'      },
  { id: 5, name: 'Eva Martinez',   email: 'eva@acme.com',    role: 'Admin',   dept: 'Engineering' },
];
let nextId = 6;

const INITIAL_USERS = () => [
  { id: 1, name: 'Alice Johnson',  email: 'alice@acme.com',  role: 'Admin',   dept: 'Engineering' },
  { id: 2, name: 'Bob Smith',      email: 'bob@acme.com',    role: 'User',    dept: 'Marketing'   },
  { id: 3, name: 'Carol White',    email: 'carol@acme.com',  role: 'Manager', dept: 'Product'     },
  { id: 4, name: 'David Chen',     email: 'david@acme.com',  role: 'User',    dept: 'Design'      },
  { id: 5, name: 'Eva Martinez',   email: 'eva@acme.com',    role: 'Admin',   dept: 'Engineering' },
];

export const api = {
  getUsers: async () => {
    await delay(900);
    return [...users];
  },

  getUserById: async (id) => {
    await delay(600);
    const user = users.find((u) => u.id === Number(id));
    if (!user) throw new Error(`User ${id} not found`);
    return { ...user };
  },

  createUser: async (data) => {
    await delay(1000);
    if (!data.name || data.name.trim().length < 2)
      throw new Error('Name must be at least 2 characters');
    const newUser = {
      id: nextId++,
      name: data.name.trim(),
      email: data.email || `user${nextId}@acme.com`,
      role: data.role || 'User',
      dept: data.dept || 'New Hire',
    };
    users.push(newUser);
    return { ...newUser };
  },

  updateUser: async (id, data) => {
    await delay(800);
    const idx = users.findIndex((u) => u.id === Number(id));
    if (idx === -1) throw new Error(`User ${id} not found`);
    users[idx] = { ...users[idx], ...data };
    return { ...users[idx] };
  },

  deleteUser: async (id) => {
    await delay(700);
    users = users.filter((u) => u.id !== Number(id));
    return { deleted: id };
  },

  reset: () => {
    users = INITIAL_USERS();
    nextId = 6;
  },
};
