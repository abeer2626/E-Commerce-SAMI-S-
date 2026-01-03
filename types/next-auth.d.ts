import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      vendorId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
    vendorId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    vendorId?: string;
  }
}
