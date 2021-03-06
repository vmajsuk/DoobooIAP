import { Button, EditText } from '@dooboo-ui/native';
import React, { ReactElement, useState } from 'react';

import { Alert } from 'react-native';
import { RootStackNavigationProps } from '../navigation/RootStackNavigator';
import { ScrollView } from 'react-native-gesture-handler';
import firebase from 'firebase';
import { getString } from '../../../STRINGS';
import styled from 'styled-components/native';
import { useThemeContext } from '@dooboo-ui/native-theme';
import { validateEmail } from '../../utils/common';

const Container = styled.SafeAreaView`
  flex: 1;
  background: ${({ theme }): string => theme.background};
`;

const Wrapper = styled.View`
  margin: 44px;
`;

const ButtonWrapper = styled.View`
  width: 100%;
  margin-top: 32px;
  flex-direction: row-reverse;
`;

interface Props {
  navigation: RootStackNavigationProps<'SignUp'>;
}

function Page(props: Props): ReactElement {
  const { navigation } = props;
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [errorEmail, setErrorEmail] = useState<string>('');
  const [errorPassword, setErrorPassword] = useState<string>('');
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<string>('');
  const [errorName, setErrorName] = useState<string>('');
  const [signingUp, setSigningUp] = useState<boolean>(false);

  const { theme } = useThemeContext();

  const requestSignUp = async (): Promise<void> => {
    if (!validateEmail(email)) {
      setErrorEmail(getString('EMAIL_FORMAT_NOT_VALID'));
    }

    if (password !== confirmPassword) {
      setErrorConfirmPassword(getString('PASSWORD_MUST_MATCH'));
    }

    setSigningUp(true);

    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);

      const currentUser = firebase.auth().currentUser;

      if (currentUser) {
        await Promise.all([
          currentUser.updateProfile({
            displayName: name,
          }),
          firebase
            .firestore()
            .collection('users')
            .doc(currentUser.uid)
            .set({
              email,
              name,
            }),
          currentUser.sendEmailVerification(),
        ]);
      }
      navigation.goBack();
      Alert.alert(getString('SUCCESS'), getString('EMAIL_VERIFICATION_SENT'));
    } catch (err) {
      Alert.alert(getString('ERROR'), `${err.code}: ${err.message}`);
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <Container>
      <ScrollView style={{ alignSelf: 'stretch' }}>
        <Wrapper>
          <EditText
            testID="input-email"
            errorTestID="error-email"
            textStyle={{
              color: theme.font,
            }}
            borderColor={theme.font}
            focusColor={theme.focused}
            placeholderTextColor={theme.placeholder}
            label={getString('EMAIL')}
            placeholder="hello@example.com"
            value={email}
            onChangeText={(text: string): void => {
              setEmail(text);
              setErrorEmail('');
            }}
            errorText={errorEmail}
            onSubmitEditing={requestSignUp}
          />
          <EditText
            testID="input-password"
            errorTestID="error-password"
            textStyle={{
              color: theme.font,
            }}
            borderColor={theme.font}
            focusColor={theme.focused}
            placeholderTextColor={theme.placeholder}
            placeholder="********"
            label={getString('PASSWORD')}
            value={password}
            onChangeText={(text: string): void => {
              setPassword(text);
              setErrorPassword('');
            }}
            style={{ marginTop: 32 }}
            errorText={errorPassword}
            onSubmitEditing={requestSignUp}
            secureTextEntry={true}
          />
          <EditText
            testID="input-confirm-password"
            errorTestID="error-confirm-password"
            textStyle={{
              color: theme.font,
            }}
            placeholder="********"
            label={getString('PASSWORD_CONFIRM')}
            value={confirmPassword}
            onChangeText={(text: string): void => {
              setConfirmPassword(text);
              setErrorConfirmPassword('');
            }}
            style={{ marginTop: 32 }}
            borderColor={theme.font}
            focusColor={theme.focused}
            placeholderTextColor={theme.placeholder}
            errorText={errorConfirmPassword}
            onSubmitEditing={requestSignUp}
            secureTextEntry={true}
          />
          <EditText
            testID="input-name"
            errorTestID="error-name"
            textStyle={{
              color: theme.font,
            }}
            label={getString('NAME')}
            placeholder={getString('NAME_HINT')}
            borderColor={theme.font}
            focusColor={theme.focused}
            placeholderTextColor={theme.placeholder}
            value={name}
            onChangeText={(text: string): void => {
              setName(text);
              setErrorName('');
            }}
            style={{ marginTop: 32 }}
            errorText={errorName}
            onSubmitEditing={requestSignUp}
          />
          <ButtonWrapper>
            <Button
              testID="btn-sign-up"
              isLoading={signingUp}
              onPress={requestSignUp}
              containerStyle={{
                height: 52,
                width: '50%',
                backgroundColor: theme.primary,
              }}
              textStyle={{
                color: theme.fontInverse,
                fontSize: 16,
                fontWeight: 'bold',
              }}
              text={getString('SIGN_UP')}
            />
          </ButtonWrapper>
        </Wrapper>
      </ScrollView>
    </Container>
  );
}

export default Page;
