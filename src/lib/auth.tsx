import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Role = "admin" | "contractor" | "auditor";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador / Gestor Ambiental",
  contractor: "Consultor / Contratista",
  auditor: "Auditor / Visualizador",
};

export const ROLE_SHORT: Record<Role, string> = {
  admin: "Admin",
  contractor: "Contratista",
  auditor: "Auditor",
};

export type User = {
  name: string;
  email: string;
  role: Role;
};

type StoredUser = User & { password: string };

type AuthContextValue = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<void>;
  signOut: () => void;
  can: {
    edit: boolean;
    upload: boolean;
  };
};

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "verderca.users";
const SESSION_KEY = "verderca.session";

const SEED_USERS: StoredUser[] = [
  {
    name: "Ana Morales",
    email: "admin@verderca.cl",
    password: "demo1234",
    role: "admin",
  },
  {
    name: "Diego Fuentes",
    email: "contratista@verderca.cl",
    password: "demo1234",
    role: "contractor",
  },
  {
    name: "Camila Rojas",
    email: "auditor@verderca.cl",
    password: "demo1234",
    role: "auditor",
  },
];

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return SEED_USERS;
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return SEED_USERS;
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readUsers();
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const users = readUsers();
    const match = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!match) throw new Error("Credenciales inválidas");
    const session: User = { name: match.name, email: match.email, role: match.role };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  }, []);

  const signUp = useCallback(
    async ({
      name,
      email,
      password,
      role,
    }: {
      name: string;
      email: string;
      password: string;
      role: Role;
    }) => {
      const users = readUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Ya existe una cuenta con ese email");
      }
      const next: StoredUser = { name, email, password, role };
      writeUsers([...users, next]);
      const session: User = { name, email, role };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setUser(session);
    },
    [],
  );

  const signOut = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn,
      signUp,
      signOut,
      can: {
        edit: user?.role === "admin",
        upload: user?.role === "admin" || user?.role === "contractor",
      },
    }),
    [user, signIn, signUp, signOut],
  );

  if (!ready) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
