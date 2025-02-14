import { normalizeToIndividualFunctionsWithLogs } from '@/components/applications/functions/normalizeToIndividualFunctionsWithLogs';
import terminalTheme from '@/data/terminalTheme';
import { useCurrentWorkspaceAndApplication } from '@/hooks/useCurrentWorkspaceAndApplication';
import { useGetFunctionLogQuery } from '@/utils/__generated__/graphql';
import { useEffect, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import { FunctionLogHistory } from './FunctionLogHistory';

SyntaxHighlighter.registerLanguage('json', json);

export function FunctionsLogsTerminalPage({ functionName }: any) {
  const { currentApplication } = useCurrentWorkspaceAndApplication();
  const [normalizedFunctionData, setNormalizedFunctionData] = useState(null);

  const { data } = useGetFunctionLogQuery({
    variables: {
      subdomain: currentApplication.subdomain,
      functionPaths: [functionName?.split('/').slice(1, 3).join('/')],
    },
    pollInterval: 3000,
  });

  useEffect(() => {
    if (!data || data.getFunctionLogs.length === 0) {
      return;
    }

    setNormalizedFunctionData(
      normalizeToIndividualFunctionsWithLogs(data.getFunctionLogs)[0],
    );
  }, [data]);

  if (
    !data ||
    data.getFunctionLogs.length === 0 ||
    !normalizedFunctionData ||
    normalizedFunctionData.logs.length === 0
  ) {
    return (
      <div className="w-full text-white rounded-lg">
        <div className="px-4 py-4 overflow-auto font-mono rounded-lg shadow-sm h-terminal bg-log">
          <div className="font-mono text-xs text-grey">
            There are no stored logs yet. Try calling your function for logs to
            appear.
          </div>
        </div>
        <FunctionLogHistory />
      </div>
    );
  }
  return (
    <div className="w-full text-white rounded-lg">
      <div className="px-4 py-4 overflow-auto font-mono rounded-lg shadow-sm h-terminal bg-log">
        {normalizedFunctionData.logs.map((log) => (
          <div
            key={`${log.date}-${log.message.slice(66)}`}
            className="flex text-sm "
          >
            <div id={`#-${log.date}`}>
              <pre className="inline">
                <span className="mr-4 text-greyscaleGrey">{log.date}</span>{' '}
                <span className="">
                  {' '}
                  <SyntaxHighlighter
                    style={terminalTheme}
                    customStyle={{
                      display: 'inline',
                    }}
                    className="inline-flex"
                    language="json"
                  >
                    {log.message}
                  </SyntaxHighlighter>
                </span>
              </pre>
            </div>
          </div>
        ))}
      </div>
      <FunctionLogHistory logs={normalizedFunctionData.logs} />
    </div>
  );
}

export default FunctionsLogsTerminalPage;
