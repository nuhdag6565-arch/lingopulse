export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  WordList: undefined;
  AddWord: undefined;
  FlashCard: undefined;
  Stats: undefined;
};

export type RootStackParamList = AuthStackParamList & AppStackParamList;
