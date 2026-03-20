'use client'

import React, { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Avatar,
  Input,
  Modal,
  ModalContent,
  ModalTrigger,
  Tooltip,
  ProgressBar,
  CircularProgress,
  Skeleton,
  ToastProvider,
  useToast,
  useTheme,
  ThemeProvider,
  type Theme,
} from '@repo/design-system'

// ---------------------------------------------------------------------------
// Top-level page wrapper — provides ThemeProvider + ToastProvider
// ---------------------------------------------------------------------------

export default function DesignSystemPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DesignSystemContent />
      </ToastProvider>
    </ThemeProvider>
  )
}

// ---------------------------------------------------------------------------
// Main content
// ---------------------------------------------------------------------------

function DesignSystemContent() {
  const { theme, setTheme } = useTheme()

  return (
    <main className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-fg-default)] p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">FocusQuest Design System</h1>
            <p className="mt-1 text-[var(--color-fg-muted)]">Component showcase — dev only</p>
          </div>
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
        </header>

        <Section title="Buttons">
          <ButtonShowcase />
        </Section>

        <Section title="Badges">
          <BadgeShowcase />
        </Section>

        <Section title="Avatars">
          <AvatarShowcase />
        </Section>

        <Section title="Inputs">
          <InputShowcase />
        </Section>

        <Section title="Cards">
          <CardShowcase />
        </Section>

        <Section title="Progress">
          <ProgressShowcase />
        </Section>

        <Section title="Skeleton">
          <SkeletonShowcase />
        </Section>

        <Section title="Tooltip">
          <TooltipShowcase />
        </Section>

        <Section title="Modal">
          <ModalShowcase />
        </Section>

        <Section title="Toast">
          <ToastShowcase />
        </Section>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Theme switcher
// ---------------------------------------------------------------------------

function ThemeSwitcher({
  theme,
  setTheme,
}: {
  theme: Theme
  setTheme: (t: Theme) => void
}) {
  const themes: Theme[] = ['light', 'dark', 'high-contrast']
  return (
    <div className="flex gap-2">
      {themes.map((t) => (
        <Button
          key={t}
          variant={theme === t ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTheme(t)}
        >
          {t}
        </Button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-[var(--color-border-default)]">
        {title}
      </h2>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Component showcases
// ---------------------------------------------------------------------------

function ButtonShowcase() {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="primary" size="sm">Small</Button>
      <Button variant="primary" size="lg">Large</Button>
      <Button variant="primary" loading>Loading</Button>
      <Button variant="primary" disabled>Disabled</Button>
    </div>
  )
}

function BadgeShowcase() {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="xp">⚡ +250 XP</Badge>
      <Badge variant="streak">🔥 14 day streak</Badge>
    </div>
  )
}

function AvatarShowcase() {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Avatar size="xs" name="Alice" />
      <Avatar size="sm" name="Bob Martin" status="online" />
      <Avatar size="md" name="Carlos Dev" status="offline" />
      <Avatar size="lg" name="Diana Prince" />
      <Avatar size="xl" name="Elara King" status="online" />
    </div>
  )
}

function InputShowcase() {
  const [value, setValue] = useState('')
  return (
    <div className="max-w-sm space-y-4">
      <Input
        label="Email"
        placeholder="you@example.com"
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        hint="We'll never share your email."
      />
      <Input
        label="Password"
        placeholder="Enter password"
        type="password"
        error="Password must be at least 8 characters."
      />
      <Input label="Disabled" placeholder="Disabled field" disabled />
    </div>
  )
}

function CardShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(['flat', 'elevated', 'bordered'] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <CardHeader>
            <p className="font-semibold capitalize">{variant}</p>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-[var(--color-fg-muted)]">
              Card body content goes here. Keep it concise.
            </p>
          </CardBody>
          <CardFooter>
            <Button variant="ghost" size="sm">Action</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function ProgressShowcase() {
  return (
    <div className="max-w-sm space-y-4">
      <ProgressBar value={30} label="Basic progress" />
      <ProgressBar value={65} variant="xp" showLabel />
      <ProgressBar value={80} variant="streak" showLabel size="lg" />
      <ProgressBar value={100} variant="success" showLabel />
      <div className="flex gap-4 items-center mt-4">
        <CircularProgress value={42} variant="primary" showLabel size={56} />
        <CircularProgress value={75} variant="xp" showLabel size={64} />
        <CircularProgress value={100} variant="success" showLabel size={56} />
      </div>
    </div>
  )
}

function SkeletonShowcase() {
  return (
    <div className="max-w-sm space-y-3">
      <Skeleton shape="line" height="1rem" />
      <Skeleton shape="line" height="1rem" width="75%" />
      <Skeleton shape="block" height="6rem" />
      <div className="flex gap-3 items-center">
        <Skeleton shape="circle" width={40} />
        <div className="flex-1 space-y-2">
          <Skeleton shape="line" height="0.875rem" />
          <Skeleton shape="line" height="0.875rem" width="60%" />
        </div>
      </div>
    </div>
  )
}

function TooltipShowcase() {
  return (
    <div className="flex gap-4 items-center">
      <Tooltip content="Top tooltip" side="top">
        <Button variant="secondary" size="sm">Hover me (top)</Button>
      </Tooltip>
      <Tooltip content="Right tooltip" side="right">
        <Button variant="secondary" size="sm">Right</Button>
      </Tooltip>
      <Tooltip content="Bottom tooltip" side="bottom">
        <Button variant="secondary" size="sm">Bottom</Button>
      </Tooltip>
    </div>
  )
}

function ModalShowcase() {
  return (
    <Modal>
      <ModalTrigger asChild>
        <Button variant="secondary">Open Modal</Button>
      </ModalTrigger>
      <ModalContent
        title="Example Modal"
        description="This modal uses Radix Dialog with backdrop blur and accessible keyboard navigation."
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-fg-muted)]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-muted)] text-xs">Esc</kbd> or
            click outside to close.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm">Cancel</Button>
            <Button variant="primary" size="sm">Confirm</Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  )
}

function ToastShowcase() {
  const { toast } = useToast()

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ variant: 'success', title: 'Saved!', description: 'Your changes have been saved.' })}
      >
        Success Toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ variant: 'error', title: 'Error', description: 'Something went wrong.' })}
      >
        Error Toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ variant: 'info', title: 'Info', description: 'New content available.' })}
      >
        Info Toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ variant: 'xp-gain', title: '+250 XP', description: 'Lesson completed!' })}
      >
        XP Toast
      </Button>
    </div>
  )
}
