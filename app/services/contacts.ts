"use client"

import * as Contacts from "expo-contacts"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { parsePhoneNumberFromString } from "libphonenumber-js/min"

export type SimpleContact = {
  name: string
  phoneNumber: string // E.164 where possible
}

const CONTACTS_KEY = "@Beacon:contacts"
const CONTACTS_IMPORTED_KEY = "@Beacon:contactsImported"

// You can change this default region if most of your users are in a specific country.
const DEFAULT_REGION = "IN"

export async function requestContactsPermission(): Promise<boolean> {
  const { status } = await Contacts.requestPermissionsAsync()
  return status === Contacts.PermissionStatus.GRANTED
}

export async function loadDeviceContacts(): Promise<SimpleContact[]> {
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers],
    pageSize: 2000,
  })

  const list: SimpleContact[] = []
  const seen = new Set<string>()

  for (const c of data) {
    if (!c?.phoneNumbers?.length) continue
    for (const p of c.phoneNumbers) {
      if (!p?.number) continue
      const e164 = toE164(p.number)
      if (!e164) continue
      if (seen.has(e164)) continue
      seen.add(e164)
      list.push({
        name: c.name || "Unknown",
        phoneNumber: e164,
      })
    }
  }
  return list
}

function toE164(input: string): string | null {
  const trimmed = input.trim()
  try {
    if (trimmed.startsWith("+")) {
      const pn = parsePhoneNumberFromString(trimmed)
      return pn?.isValid() ? pn.number : null
    } else {
      const pn = parsePhoneNumberFromString(trimmed, DEFAULT_REGION as any)
      return pn?.isValid() ? pn.number : null
    }
  } catch {
    return null
  }
}

export async function saveContacts(contacts: SimpleContact[]) {
  await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts))
  await AsyncStorage.setItem(CONTACTS_IMPORTED_KEY, "true")
}

export async function getStoredContacts(): Promise<SimpleContact[]> {
  const raw = await AsyncStorage.getItem(CONTACTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as SimpleContact[]
  } catch {
    return []
  }
}

export async function getContactsImportedFlag(): Promise<boolean> {
  const v = await AsyncStorage.getItem(CONTACTS_IMPORTED_KEY)
  return v === "true"
}

export async function clearContacts() {
  await AsyncStorage.removeItem(CONTACTS_KEY)
  await AsyncStorage.removeItem(CONTACTS_IMPORTED_KEY)
}
