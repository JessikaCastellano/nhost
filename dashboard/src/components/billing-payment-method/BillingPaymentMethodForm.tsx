import { CountrySelector } from '@/components/dashboard/CountrySelector';
import {
  refetchGetPaymentMethodsQuery,
  refetchPrefetchNewAppQuery,
  useInsertNewPaymentMethodMutation,
  useUpdateWorkspaceMutation,
} from '@/generated/graphql';
import { useSubmitState } from '@/hooks/useSubmitState';
import { Text } from '@/ui/Text';
import Button from '@/ui/v2/Button';
import { discordAnnounce } from '@/utils/discordAnnounce';
import { nhost } from '@/utils/nhost';
import { triggerToast } from '@/utils/toast';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PK!);

type AddPaymentMethodFormProps = {
  close: () => void;
  onPaymentMethodAdded?: () => Promise<void>;
  workspaceId: string;
};

function AddPaymentMethodForm({
  close,
  onPaymentMethodAdded,
  workspaceId,
}: AddPaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const user = nhost.auth.getUser();

  const [countryCode, setCountryCode] = useState('Select Country');

  const [insertNewPaymentMethod] = useInsertNewPaymentMethodMutation({
    refetchQueries: [
      refetchPrefetchNewAppQuery(),
      refetchGetPaymentMethodsQuery({
        workspaceId,
      }),
    ],
  });

  const [updateWorkspace] = useUpdateWorkspaceMutation();
  const { submitState, setSubmitState } = useSubmitState();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitState({
      loading: true,
      error: null,
    });

    try {
      // create payment method
      const cardElement = elements.getElement(CardElement);

      const { error: createPaymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

      if (createPaymentMethodError) {
        throw new Error(
          createPaymentMethodError.message || 'Unknown error occurred.',
        );
      }

      // attach new payment method to workspace
      const { error: attachPaymentMethodError } = await nhost.functions.call(
        '/stripe-attach-payment-method',
        {
          workspaceId,
          paymentMethodId: paymentMethod.id,
        },
      );

      if (attachPaymentMethodError) {
        throw Error((attachPaymentMethodError as any).response.data);
      }

      // update workspace with new country code in database
      await updateWorkspace({
        variables: {
          id: workspaceId,
          workspace: {
            addressCountryCode: countryCode,
          },
        },
      });

      // insert payment method for workspace in database
      await insertNewPaymentMethod({
        variables: {
          workspaceId,
          paymentMethod: {
            stripePaymentMethodId: paymentMethod.id,
            workspaceId,
            cardExpMonth: paymentMethod.card.exp_month,
            cardExpYear: paymentMethod.card.exp_year,
            cardLast4: paymentMethod.card.last4,
            cardBrand: paymentMethod.card.brand,
            isDefault: true,
          },
        },
        refetchQueries: [
          refetchGetPaymentMethodsQuery({
            workspaceId,
          }),
        ],
      });
    } catch (error) {
      triggerToast(`Error adding a payment method: ${error.message}`);
      discordAnnounce(
        `Error trying to set up payment method: ${error.message}. (${user.email})`,
      );
      setSubmitState({
        error: Error(error.message),
        loading: false,
      });
      return;
    }

    // payment method added successfylly

    triggerToast(`New payment method added`);

    close();

    discordAnnounce(
      `(${user.email}) added a new credit card to workspace id: ${workspaceId}.`,
    );

    if (onPaymentMethodAdded) {
      onPaymentMethodAdded();
    }
  };

  return (
    <div className="px-6 pt-6 pb-6 text-left w-modal2">
      <div className="flex flex-col">
        <form onSubmit={handleSubmit}>
          <Text
            variant="subHeading"
            color="greyscaleDark"
            size="large"
            className="text-center"
          >
            Add Payment Details
          </Text>
          <Text
            variant="body"
            color="greyscaleDark"
            size="small"
            className="font-normal text-center"
          >
            We&apos;ll store these in your workspace for future use.
          </Text>
          <div className="w-full px-2 py-2 my-2 mt-6 rounded-lg border-1">
            <CardElement
              onReady={(element) => element.focus()}
              options={{
                hidePostalCode: false,
                iconStyle: 'default',
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
          <div className="mb-4 space-x-2">
            <CountrySelector value={countryCode} onChange={setCountryCode} />
          </div>
          <div className="flex flex-col">
            <Button
              type="submit"
              color="primary"
              className=""
              loading={submitState.loading}
            >
              Add Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

type BillingPaymentMethodFormProps = {
  close: () => void;
  onPaymentMethodAdded?: () => Promise<void>;
  workspaceId: string;
};

export function BillingPaymentMethodForm({
  close,
  onPaymentMethodAdded,
  workspaceId,
}: BillingPaymentMethodFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <AddPaymentMethodForm
        close={close}
        onPaymentMethodAdded={onPaymentMethodAdded}
        workspaceId={workspaceId}
      />
    </Elements>
  );
}

export default BillingPaymentMethodForm;
