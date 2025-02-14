import { ApplicationMenuItems } from '@/components/applications/ApplicationMenuItems';
import { ChangePlanModal } from '@/components/applications/ChangePlanModal';
import { useDialog } from '@/components/common/DialogProvider';
import useIsPlatform from '@/hooks/common/useIsPlatform';
import { useCurrentWorkspaceAndApplication } from '@/hooks/useCurrentWorkspaceAndApplication';
import Button from '@/ui/v2/Button';
import Chip from '@/ui/v2/Chip';
import Text from '@/ui/v2/Text';
import Image from 'next/image';

export default function OverviewTopBar() {
  const isPlatform = useIsPlatform();
  const { currentApplication } = useCurrentWorkspaceAndApplication();
  const isPro = !currentApplication?.plan?.isFree;
  const { openAlertDialog } = useDialog();

  if (!isPlatform) {
    return (
      <div className="flex flex-row place-content-between items-center py-5">
        <div className="flex flex-row items-center space-x-2">
          <div className="flex">
            <div className="h-10 w-10 overflow-hidden rounded-lg">
              <Image
                src="/logos/new.svg"
                alt="Nhost Logo"
                width={40}
                height={40}
              />
            </div>

            <Text variant="h2" component="h1" className="ml-2">
              local
            </Text>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row place-content-between items-center py-5">
      <div className="flex flex-row items-center space-x-2">
        <div className="grid grid-flow-col items-center gap-2">
          <div className="h-10 w-10 overflow-hidden rounded-lg">
            <Image
              src="/logos/new.svg"
              alt="Nhost Logo"
              width={40}
              height={40}
            />
          </div>

          <Text variant="h2" component="h1">
            {currentApplication.name}
          </Text>
        </div>

        {isPro ? (
          <Chip
            className="self-center bg-blue font-medium text-white"
            size="small"
            label="Pro Plan"
          />
        ) : (
          <>
            <Chip
              className="self-center font-medium text-greyscaleDark"
              size="small"
              label="Free Plan"
              color="default"
              variant="filled"
            />
            <Button
              variant="borderless"
              className="mr-2"
              onClick={() => {
                openAlertDialog({
                  title: 'Upgrade your plan.',
                  payload: <ChangePlanModal />,
                  props: {
                    PaperProps: { className: 'p-0' },
                    hidePrimaryAction: true,
                    hideSecondaryAction: true,
                    hideTitle: true,
                    maxWidth: 'lg',
                  },
                });
              }}
            >
              Upgrade
            </Button>
          </>
        )}
      </div>

      <ApplicationMenuItems />
    </div>
  );
}
