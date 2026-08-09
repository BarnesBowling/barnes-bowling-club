export function formatSurnameFirst(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length < 2) return fullName;
  const surname = parts[parts.length - 1];
  const firstName = parts.slice(0, -1).join(' ');
  return `${surname}, ${firstName}`;
}

export function sortBySurname(names: string[]): string[] {
  return [...names].sort((a, b) => {
    const surnameA = a.trim().split(' ').pop()?.toLowerCase() ?? '';
    const surnameB = b.trim().split(' ').pop()?.toLowerCase() ?? '';
    return surnameA.localeCompare(surnameB);
  });
}
