# Tandem — Product Manifest / Source of Truth

**Current name:** Tandem  
**Current tagline:** Connect Beyond Language  
**Status:** Development / early validation

## What Tandem is

Tandem is a cross-language communication app that helps two people communicate naturally when they do not share a comfortable language.

Translation is the mechanism, but communication is the product.

**Core idea:** Two people. Different languages. One conversation.

The long-term vision is to let people meet, communicate, and stay connected without requiring either person to switch to a language they are less comfortable using.

## The problem

Two people may want to communicate but have no language they can both communicate comfortably in.

This can happen at international meetups, while traveling, in restaurants and hotels, in multicultural communities, or when two people meet and want to stay connected.

The problem is:

> They want to communicate, but they do not share a comfortable language.

## Core product promise

> **Let people communicate in the language they are comfortable with, even when the other person speaks a different language.**

A successful interaction should feel less like "we are using a translator" and more like "we can actually talk to each other."

## Product model

The fundamental unit is a **conversation between people**, not a translation request.

A conversation should eventually be able to begin in person and continue remotely.

### Preferred two-phone flow

1. User A creates a new conversation.
2. User A's language is selected from their profile or for the conversation.
3. User A can choose another language for that conversation if multilingual.
4. Tandem generates a QR code or equivalent invitation.
5. User B scans it.
6. User B reaches the conversation landing/join page.
7. If needed, User B enters a name and chooses a language.
8. User B can optionally log in/sign up using available authentication.
9. The conversation is created.
10. Both people communicate using their own phones.

The exact authentication and persistence model is still under development.

## In-person communication

The **preferred long-term in-person experience is two phones**, not passing one phone back and forth.

The current one-phone experience is a practical prototype and a fallback for situations where a second phone or account setup is inconvenient.

The preferred experience is:

**Person A's phone ↔ Tandem ↔ Person B's phone**

The one-phone mode can remain useful for prototypes, event demonstrations, quick interactions, and cases where pairing another device is impractical.

It is **not the defining identity of the product**.

## Voice input

Voice input is primarily useful for in-person conversations, where speaking instead of typing can make communication faster and more natural.

Implementation complexity and timing are still to be determined.

## Messenger / continued communication

After people connect, they should be able to continue communicating remotely using their own phones.

Each person should be able to communicate in their preferred language, with translation functioning as part of the messaging experience.

The goal is:

> **Meet someone you could not easily communicate with, then keep talking to them without the language barrier getting in the way.**

## Language selection

Users can have a preferred language, but language should remain conversation-specific.

A multilingual user should be able to use a different language for a particular conversation.

- Default language can come from the user's profile.
- A conversation can override the default.
- Both people choose the language they want to use.
- English should never be assumed to be the default language.

## Future features

### Tone options
Casual, friendly, neutral, or more formal tones so translated messages fit the relationship and context.

### Two-phone QR pairing
Create a conversation and invite another person with a QR code, with minimal friction for the person joining.

### Voice input
Speak instead of type during in-person conversations.

### Conversation history
View previous conversations with people they have connected with, like a normal messenger.

### On-demand conversation summaries
Users can ask for a quick summary of a previous conversation to remember who someone is, what they discussed, and useful details. Summaries should not be assumed to happen automatically.

### Persistent cross-language messaging
Continue talking remotely without requiring a shared language.

## Use cases

- International meetups
- Travel
- Restaurants and hotels
- Tourist interactions
- New friendships
- International communities
- Any situation where two people do not share a comfortable language

## Product principles

### Communication first, translation second
Design around having a conversation, not translating text.

### Do not center English
English is only one supported language.

### Preserve each person's language
Neither person should have to switch to a language they are less comfortable using.

### Natural communication matters
Prioritize natural phrasing and context over literal word-for-word translation.

### Minimize friction
Make it easy to go from "I want to talk to this person" to "We're talking."

### Social connection is the long-term direction
The product should grow from "This helped me talk to someone" into "This is how I stay connected with people I would otherwise struggle to communicate with."

## Onboarding direction

The first screen should explain the problem and usefulness, not the technical implementation.

The user should immediately understand:

- This is for talking to people who speak another language.
- They can communicate using the language they are comfortable with.
- Tandem is useful in person and can eventually help people stay connected afterward.

The Friday prototype may use one phone, but onboarding should **not imply that one phone is the permanent design**.

## UX direction

Tandem should feel simple, warm, human, approachable, and fast to understand.

Avoid unnecessary translation jargon.

The existing overlapping-circle logo is being retained because it is clean and represents two people coming together without restricting the product to a specific language or communication method.

## Public-facing positioning

Safe high-level description:

> **Tandem helps people communicate when they do not share a comfortable language.**

It is fine to discuss the problem, general concept, current prototype, use cases, and broad future experience.

Do not unnecessarily disclose:

- Private source code
- API keys or credentials
- Backend architecture
- Database structure
- Proprietary prompts or implementation
- Detailed security mechanisms
- Unreleased technical implementation
- Detailed roadmap

If asked about implementation, answer at an appropriate high level without revealing confidential details.

## Security and IP hygiene

Maintain:

- A private source repository
- Secure storage of API keys and secrets
- No credentials embedded in public/client code
- Dated development records
- Clear ownership of code and assets
- Appropriate agreements if collaborators are added

If patent protection ever becomes important, seek professional IP advice before additional public disclosure where practical. Public-disclosure rules differ by jurisdiction.

## One-sentence definition

> **Tandem is a cross-language communication app that helps two people communicate naturally when they do not share a comfortable language, letting them connect in person and eventually continue the conversation on their own phones.**

## North-star experience

> **"I met someone I couldn't normally communicate with, but we were able to have a real conversation. And if we want to stay connected, we can keep talking without the language barrier getting in the way."**
