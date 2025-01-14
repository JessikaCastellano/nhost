import InlineCode from '@/components/common/InlineCode';
import DataBrowserEmptyState from '@/components/data-browser/DataBrowserEmptyState';
import DataBrowserLayout from '@/components/data-browser/DataBrowserLayout';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';

export default function DataBrowserDatabaseDetailsPage() {
  const {
    query: { dataSourceSlug },
  } = useRouter();

  if (dataSourceSlug !== 'default') {
    return (
      <DataBrowserEmptyState
        title="Database not found"
        description={
          <span>
            Database{' '}
            <InlineCode className="max-h-[32px] bg-gray-200 bg-opacity-80 px-1.5 text-sm">
              {dataSourceSlug}
            </InlineCode>{' '}
            does not exist.
          </span>
        }
      />
    );
  }

  return (
    <DataBrowserEmptyState
      title="Database"
      description="Select a table from the sidebar to get started."
    />
  );
}

DataBrowserDatabaseDetailsPage.getLayout = function getLayout(
  page: ReactElement,
) {
  return <DataBrowserLayout>{page}</DataBrowserLayout>;
};
