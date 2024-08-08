// app/lib/identityUtils.ts

import api from './api';

export async function createIdentity(): Promise<{ did: string, publicKey: string }> {
  const response = await api.post('/api/identity/create');
  const { did, publicKey, proof, publicSignals, challenge } = response.data;
  
  // Store proof and challenge locally for later use
  localStorage.setItem(`${did}_proof`, JSON.stringify(proof));
  localStorage.setItem(`${did}_publicSignals`, JSON.stringify(publicSignals));
  localStorage.setItem(`${did}_challenge`, challenge);

  return { did, publicKey };
}

export async function login(did: string): Promise<boolean> {
  const proof = JSON.parse(localStorage.getItem(`${did}_proof`) || 'null');
  const publicSignals = JSON.parse(localStorage.getItem(`${did}_publicSignals`) || 'null');
  const challenge = localStorage.getItem(`${did}_challenge`);

  if (!proof || !publicSignals || !challenge) {
    throw new Error('Login data not found');
  }

  const response = await api.post('/api/identity/verify', { did, proof, publicSignals, challenge });
  return response.data.verified;
}