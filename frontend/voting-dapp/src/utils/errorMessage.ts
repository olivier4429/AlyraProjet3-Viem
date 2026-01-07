/**
 * Transforme les messages d'erreur techniques en messages lisibles
 */
export const getErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  // Erreurs utilisateur
  if (message.includes('user rejected') || message.includes('user denied')) {
    return 'Transaction annulée par l\'utilisateur';
  }
  
  if (message.includes('insufficient funds')) {
    return 'Fonds insuffisants pour effectuer cette transaction';
  }
  
  // Erreurs réseau
  if (message.includes('network') || message.includes('connection')) {
    return 'Erreur de connexion au réseau. Vérifiez votre connexion.';
  }
  
  // Erreurs de gas
  if (message.includes('gas')) {
    return 'Erreur de gas. La transaction nécessite peut-être plus de gas.';
  }
  
  // Erreurs de contrat
  if (message.includes('revert')) {
    return 'Transaction refusée par le contrat. Vérifiez les conditions.';
  }
  
  if (message.includes('already registered')) {
    return 'Cette adresse est déjà enregistrée';
  }
  
  if (message.includes('not registered')) {
    return 'Vous n\'êtes pas enregistré comme votant';
  }
  
  if (message.includes('already voted')) {
    return 'Vous avez déjà voté';
  }
  
  // Message par défaut
  return error.message;
};

/**
 * Vérifie si une erreur est due à une action utilisateur (non critique)
 */
export const isUserError = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  return message.includes('user rejected') || 
         message.includes('user denied') ||
         message.includes('cancelled');
};

/**
 * Format une adresse Ethereum pour l'affichage
 */
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};