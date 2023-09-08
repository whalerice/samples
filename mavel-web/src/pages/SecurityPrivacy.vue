<template>
  <div class="text-h3 mb-80 fw-700">
    {{ $t('nav.sp') }}
  </div>
  <q-timeline color="secondary" layout="dense" class="security-privacy-timeline-container q-mb-xl">
    <q-timeline-entry heading>
      {{ $t('sp.security.title') }}
    </q-timeline-entry>

    <q-timeline-entry color="custom-purple-02" :subtitle="$t('sp.ddos.header')" icon="lock">
      <div>
        {{ $t('sp.ddos.content') }}
      </div>
    </q-timeline-entry>

    <q-timeline-entry color="custom-purple-02" :subtitle="$t('sp.512_encryption.header')" icon="lock">
      <div>
        {{ $t('sp.512_encryption.content') }}
      </div>
    </q-timeline-entry>
    <q-timeline-entry color="custom-purple-02" :subtitle="$t('sp.secure_wallet.header')" icon="lock">
      <div>
        {{ $t('sp.secure_wallet.content') }}
      </div>
    </q-timeline-entry>
    <q-timeline-entry color="custom-purple-02" :subtitle="$t('sp.gambling.header')" icon="lock">
      <div>
        {{ $t('sp.gambling.content') }}
      </div>
    </q-timeline-entry>
  </q-timeline>
  <q-timeline color="secondary" layout="dense" class="security-privacy-timeline-container">
    <q-timeline-entry heading> {{ $t('sp.privacy.title') }}</q-timeline-entry>

    <q-timeline-entry color="custom-purple-01" :subtitle="$t('sp.information.header')" icon="person">
      <div class="column">
        <span> {{ $t('sp.information.content_01') }}</span>
        <span> {{ $t('sp.information.content_02') }}</span>
      </div>
    </q-timeline-entry>

    <q-timeline-entry color="custom-purple-01" :subtitle="$t('sp.personal.header')" icon="person">
      <div>
        {{ $t('sp.personal.content') }}
      </div>
    </q-timeline-entry>

    <q-timeline-entry color="custom-purple-01" :subtitle="$t('sp.disclosures.header')" icon="person">
      <div>
        {{ $t('sp.disclosures.content') }}
      </div>
    </q-timeline-entry>

    <q-timeline-entry color="custom-purple-01" :subtitle="$t('sp.internet.header')" icon="person">
      <div>
        {{ $t('sp.internet.content') }}
      </div>
    </q-timeline-entry>
  </q-timeline>
</template>
