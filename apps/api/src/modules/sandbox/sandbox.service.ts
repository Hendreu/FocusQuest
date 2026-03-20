import { spawn } from 'child_process'

export interface TestResult {
  name: string
  passed: boolean
  expected?: string
  actual?: string
}

export interface SandboxResult {
  stdout: string
  stderr: string
  exit_code: number
  tests_results: TestResult[]
}

// Patterns that indicate dangerous imports/requires we want to block
const BLOCKED_PATTERNS = [
  /\bimport\s+.*['"]fs['"]/,
  /\brequire\s*\(\s*['"]fs['"]/,
  /\bimport\s+.*['"]net['"]/,
  /\brequire\s*\(\s*['"]net['"]/,
  /\bimport\s+.*['"]child_process['"]/,
  /\brequire\s*\(\s*['"]child_process['"]/,
  /\bimport\s+.*['"]os['"]/,
  /\brequire\s*\(\s*['"]os['"]/,
  /\bimport\s+.*['"]path['"]/,
  /\brequire\s*\(\s*['"]path['"]/,
  /\b__import__\s*\(\s*['"]os['"]/,
  /\bimport\s+os\b/,
  /\bimport\s+sys\b/,
  /\bimport\s+subprocess\b/,
  /\bimport\s+socket\b/,
  /\bopen\s*\(/,             // Python file open
]

export function isSafeCode(code: string): boolean {
  return !BLOCKED_PATTERNS.some((pattern) => pattern.test(code))
}

function runProcess(
  command: string,
  args: string[],
  timeoutMs: number
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    let stdout = ''
    let stderr = ''
    let finished = false

    const proc = spawn(command, args, {
      timeout: timeoutMs,
      shell: false,
    })

    proc.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    proc.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString() })

    proc.on('close', (code) => {
      if (finished) return
      finished = true
      resolve({ stdout, stderr, exitCode: code ?? 1 })
    })

    proc.on('error', (err) => {
      if (finished) return
      finished = true
      resolve({ stdout, stderr: err.message, exitCode: 1 })
    })

    // Hard kill after timeout
    setTimeout(() => {
      if (finished) return
      finished = true
      proc.kill('SIGKILL')
      resolve({ stdout, stderr: 'Execution timed out (5s limit)', exitCode: 124 })
    }, timeoutMs)
  })
}

export async function runSandbox(
  language: 'python' | 'javascript',
  code: string,
  timeoutMs = 5000
): Promise<SandboxResult> {
  if (!isSafeCode(code)) {
    return {
      stdout: '',
      stderr: 'SecurityError: Code contains blocked imports.',
      exit_code: 1,
      tests_results: [],
    }
  }

  let result: { stdout: string; stderr: string; exitCode: number }

  if (language === 'python') {
    result = await runProcess('python3', ['-c', code], timeoutMs)
  } else {
    result = await runProcess('node', ['-e', code], timeoutMs)
  }

  return {
    stdout: result.stdout,
    stderr: result.stderr,
    exit_code: result.exitCode,
    tests_results: [],
  }
}
