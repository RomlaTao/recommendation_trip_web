import { useState } from 'react'
import { PublicSiteLayout } from '@/components/layouts/PublicSiteLayout'
import { ProfileForm } from '@/features/users/components/ProfileForm'
import { ChangePasswordForm } from '@/features/users/components/ChangePasswordForm'

type Tab = 'profile' | 'security'

const tabs: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'ACCOUNT' },
  { id: 'security', label: 'SECURITY' },
]

export default function AccountSettingsRoute() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  return (
    <PublicSiteLayout>
      <div className="max-w-screen-sm mx-auto px-gutter py-stack-lg pt-32 min-h-screen">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-stack-md">ACCOUNT SETTINGS</h1>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant mb-stack-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`font-label-caps text-[11px] tracking-wider pb-3 pr-8 border-b-2 transition-colors duration-200 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && <ProfileForm />}
        {activeTab === 'security' && <ChangePasswordForm />}
      </div>
    </PublicSiteLayout>
  )
}
