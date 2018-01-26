function getSubFromJWT (jwt) {
  try {
    return JSON.parse(atob(jwt.split('.')[1])).sub;
  } catch (e) {
    return null;
  }
}

export {
  getSubFromJWT
};
