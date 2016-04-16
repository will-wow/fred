export function pluralize(word: string, length: number): string {
  const ending = length === 1 ? '' : 's';
  return word + ending;
}

export function userOrYou(user: string = 'you') {
  return user;
}

export function usersOrYour(user?: string) {
  return user ? `${user}'s` : 'your';
}