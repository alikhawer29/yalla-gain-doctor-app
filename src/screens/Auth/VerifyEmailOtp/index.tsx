import { Formik } from 'formik';
import AuthWrapper from '../../../components/AuthWrapper';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import Row from '../../../components/Row';
import Text from '../../../components/Text';
import colors from '../../../utils/colors';
import { formatTimer } from '../../../utils/helper';
import styles from '../styles';
import useVerifyEmailOtpController from './useVerifyEmailOtpController';

const VerifyEmailOtp = () => {
  const {
    schema,
    refs: { formik_ref },
    values: { initial, email, isLoading, timer, resendLoading },
    functions: { onPressBackToLogin, onSubmit, onResend },
  } = useVerifyEmailOtpController();

  return (
    <AuthWrapper
      title="Verify your email"
      subtitle={`Enter the OTP sent to ${email}.`}
    >
      <Formik
        innerRef={formik_ref}
        initialValues={initial}
        validationSchema={schema}
        onSubmit={onSubmit}
      >
        {({ values: data, handleSubmit, handleChange, errors, touched }) => (
          <>
            <Input
              type="number"
              label="OTP"
              placeholder="Enter verification code"
              required
              value={data?.otp}
              onChangeText={handleChange('otp')}
              error={touched?.otp ? (errors?.otp as string) : ''}
              maxLength={8}
            />
            <Row justify="space-between">
              <Text>{formatTimer(timer)}</Text>
              <Text
                underline
                onPress={onResend}
                color={timer > 0 ? colors.icon_gray : colors.white}
              >
                {resendLoading ? 'Sending…' : 'Resend OTP'}
              </Text>
            </Row>
            <Button
              text="Verify"
              style={styles.button}
              onPress={handleSubmit}
              loading={isLoading}
            />
          </>
        )}
      </Formik>
      <Text
        position="center"
        underline
        size={16}
        weight="semibold"
        style={styles.helper_text}
        onPress={onPressBackToLogin}
      >
        Back to login
      </Text>
    </AuthWrapper>
  );
};

export default VerifyEmailOtp;
