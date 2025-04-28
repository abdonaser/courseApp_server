function errorMessage(error) {
  const destructuredErrors = error.reduce((acc, error) => {
    if (!acc[error.path]) {
      acc[error.path] = [];
    }
    acc[error.path].push(error.msg);
    return acc;
  }, {});

  const errResult = Object.keys(destructuredErrors).reduce((acc, key) => {
    acc[key] = destructuredErrors[key].join(' && ')
    return acc;
  }, {})

  const formattedString = Object.entries(errResult)
    .map(([key, value]) => `${key}: "${value}"`)
    .join(' and ')

  return errResult
}


module.exports = errorMessage