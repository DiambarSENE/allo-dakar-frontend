// En production, ces valeurs sont injectées au moment du build (CI/CD) via un remplacement de ce
// fichier ou un script de substitution — jamais de secret ici : apiUrl/keycloak.url/realm/clientId
// sont des informations publiques (visibles dans le bundle par construction), voir README §Sécurité.
export const environment = {
  production: true,
  apiUrl: 'https://api.allodakar.sn/api/v1',
  keycloak: {
    url: 'https://auth.allodakar.sn',
    realm: 'allo-dakar',
    clientId: 'allo-dakar-frontend',
  },
};
