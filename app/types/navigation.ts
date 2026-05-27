export type RootParamList = {
  LoginNative: { source?: string } | undefined
  CreateProfile: undefined
  ImportContacts: undefined
  ContactsConnect: undefined
  Main: undefined
  EditProfile: undefined
  ChangeNumberRequest: undefined
  ChangeNumberVerify: { phone: string }
  AcceptInvite: { token: string }
}
