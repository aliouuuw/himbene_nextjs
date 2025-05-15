import * as bcryptjs from 'bcryptjs';

export const hash = async (password: string, saltRounds: number): Promise<string> => {
  return bcryptjs.hash(password, saltRounds);
};

export const compare = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
}; 