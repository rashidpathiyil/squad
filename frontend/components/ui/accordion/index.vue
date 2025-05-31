<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from 'reka-ui'

const accordionItems = [
  {
    value: 'item-1',
    title: 'Smarter Data, Smarter Decisions',
    content: 'LeadUp gives your team complete, reliable contact profiles — without the noise. No more guessing who you’re reaching or spending hours on manual research.',
  },
  {
    value: 'item-2',
    title: 'No More Stale CRM Records',
    content: 'People change jobs. Companies evolve. LeadUp keeps your data fresh by continuously pulling from public web sources, so you’re never stuck chasing dead leads.Yes. It\'s unstyled by default, giving you freedom over the look and feel.',
  },
  {
    value: 'item-3',
    title: 'Scales With You',
    content: 'Whether you’re enriching a hundred contacts or a hundred thousand, LeadUp is designed to handle growing volumes and evolving data needs.',
  },
  {
    value: 'item-4',
    title: 'No Expensive APIs Needed',
    content: 'Leadup skips the costly third-party tools and gives you powerful lead enrichment.',
  },
  {
    value: 'item-5',
    title: 'Privacy-Conscious by Design',
    content: 'We only use publicly available data and never rely on shady scraping or purchased lists. That means better results and cleaner compliance.',
  },
  {
    value: 'item-6',
    title: 'Built-In Confidence Scores',
    content: 'Every enriched field comes with a confidence score, showing how likely the information is correct. This helps your team make smarter, faster decisions with more trust in the data.',
  },
]
</script>
<template>
  <div class="w-full space-y-6">
    <!-- Heading -->


    <!-- Accordion -->
    <AccordionRoot class="bg-mauve6 w-full rounded-lg shadow-[0_2px_10px] shadow-black/5 border border-gray-700"
      default-value="item-1" type="single" :collapsible="true">
      <template v-for="item in accordionItems" :key="item.value">
        <AccordionItem
          class="focus-within:shadow-mauve12 mt-px overflow-hidden first:mt-0 first:rounded-t-[7px] last:rounded-b-[7px] focus-within:relative shadow-[0_2px_0] shadow-gray-800/90"
          :value="item.value">
          <AccordionHeader class="flex ">
            <AccordionTrigger
              class="text-grass11 p-[25px] hover:bg-mauve2 flex h-[45px] flex-1 cursor-default items-center justify-between text-white bg-gray-800/30 px-5 text-[18px] leading-none shadow-[0_1px_0] shadow-gray-800/90 outline-none group">
              <span>{{ item.title }}</span>
              <Icon icon="radix-icons:chevron-down"
                class="text-white ease-[cubic-bezier(0.87,_0,_0.13,_1)] transition-transform duration-300 group-data-[state=open]:rotate-180"
                aria-label="Expand/Collapse" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent
            class="text-mauve11 text-white data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden text-[16px] font-extralight bg-gray-800/30">
            <div class="px-5 py-4">
              {{ item.content }}
            </div>
          </AccordionContent>
        </AccordionItem>
      </template>
    </AccordionRoot>
  </div>
</template>