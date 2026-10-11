// Environnement de développement local (valeurs par défaut si aucune substitution build n'est
// faite — voir angular.json "fileReplacements" pour environment.production.ts).
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api/v1',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'allo-dakar',
    clientId: 'allo-dakar-frontend',
  },
};
