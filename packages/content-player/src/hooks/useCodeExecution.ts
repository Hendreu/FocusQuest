import { useState, useCallback } from 'react'

interface TestResult {
  name: string
  passed: boolean
  expected?: string
  actual?: string
}

interface SandboxResult {
  stdout: string
  stderr: string
  exitCode: number
  testResults: TestResult[]
}

interface UseCodeExecutionResult {
  output: SandboxResult | null
  isRunning: boolean
  hasPassedAllTests: boolean
  execute: (language: string, code: string) => Promise<void>
}

export function useCodeExecution(
  apiBaseUrl: string,
  accessToken: string | null
): UseCodeExecutionResult {
  const [output, setOutput] = useState<SandboxResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const hasPassedAllTests =
    output !== null &&
    output.testResults.length > 0 &&
    output.testResults.every((t) => t.passed)

  const execute = useCallback(
    async (language: string, code: string) => {
      setIsRunning(true)
      setOutput(null)
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

        const res = await fetch(`${apiBaseUrl}/sandbox/run`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ language, code }),
        })

        const json = (await res.json()) as {
          data: { stdout: string; stderr: string; exit_code: number; tests_results: TestResult[] }
        }

        setOutput({
          stdout: json.data.stdout,
          stderr: json.data.stderr,
          exitCode: json.data.exit_code,
          testResults: json.data.tests_results ?? [],
        })
      } catch (err) {
        setOutput({
          stdout: '',
          stderr: err instanceof Error ? err.message : 'Execution failed',
          exitCode: 1,
          testResults: [],
        })
      } finally {
        setIsRunning(false)
      }
    },
    [apiBaseUrl, accessToken]
  )

  return { output, isRunning, hasPassedAllTests, execute }
}
