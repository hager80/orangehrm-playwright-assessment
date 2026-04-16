export function generateUserData() {
  const timestamp = Date.now().toString().slice(-6);

  return {
    username: `testuser${timestamp}`,
    password: `Qa@${timestamp}Aa1`,
    firstName: `Auto${timestamp}`,
    lastName: `User`,
  };
}