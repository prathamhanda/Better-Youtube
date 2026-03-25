<div align="center">

# BetterYoutube

### **A calmer YouTube experience — scrolling, PiP, speed controls, SponsorBlock, and focus mode.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-0f172a?style=flat-square)](#)
[![Microsoft Edge](https://img.shields.io/badge/Microsoft%20Edge-Supported-0078D7?style=flat-square&logo=microsoftedge&logoColor=white)](#installation)
[![Google Chrome](https://img.shields.io/badge/Google%20Chrome-Supported-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](#installation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<br />

[🚀 Quick Start](#-quick-start) • [✨ Features](#-feature-highlights) • [🧩 Usage](#-usage) • [🔐 Permissions](#-permissions) • [🤝 Contributing](#-contributing)

</div>

## 🎯 What is BetterYoutube?

BetterYoutube is a Chromium extension (Edge/Chrome) that improves the YouTube watch experience by reducing distractions and adding practical controls directly on the page.

It focuses on:
- Keeping recommendations/comments usable without infinite-scroll traps
- Making Picture-in-Picture easier to access
- Fast, reliable playback speed controls (with a small on-video badge)
- Optional SponsorBlock auto-skip
- Optional Focus Mode to hide distraction surfaces

---

## 🎬 Demo

![better-youtube-demo](https://github.com/user-attachments/assets/4f89a230-30a3-4f70-927c-8beb35110058)

---

## ✨ Feature Highlights

<table>
	<tr>
		<td width="20%" align="center"><h3>📜</h3><b>Better Scrolling</b><br/><sub>Scrollable containers for recommendations + comments</sub></td>
		<td width="20%" align="center"><h3>📺</h3><b>PiP</b><br/><sub>In-player button + popup trigger</sub></td>
		<td width="20%" align="center"><h3>⏩</h3><b>Speed Controls</b><br/><sub>Keyboard shortcuts + on-video badge</sub></td>
		<td width="20%" align="center"><h3>⏭️</h3><b>SponsorBlock</b><br/><sub>Auto-skip sponsors/intros/outros/interactions</sub></td>
		<td width="20%" align="center"><h3>🎯</h3><b>Focus Mode</b><br/><sub>Hide Shorts/comments/recommendations</sub></td>
	</tr>
</table>

### Details

**📜 Better Scrolling**
- Replaces infinite scroll with tidy scrollable containers for **recommendations** and **comments**
- Avoids nested scrollbars by enforcing a single scroller in the watch sidebar

**📺 Picture-in-Picture (PiP)**
- Adds a PiP button to YouTube’s player controls
- Trigger PiP from the extension popup (“Pop Out Video”)

**⏩ Playback Speed Controls**
- On-video speed badge showing the current playback rate
- Keyboard shortcuts (defaults): Slower `s`, Faster `d`, Reset `r`
- Customizable speed step (default `0.25x`)
- Click the on-video badge to reset to `1.00x`

**⏭️ SponsorBlock Auto-Skip**
- Uses the public SponsorBlock community database
- Skips segment categories: Sponsor, Intro, Outro, Interaction
- Lightweight caching to reduce repeated network calls

**🎯 Focus Mode**
- Toggle hiding of: Shorts, Comments, Recommendations (including end screen)
- Uses CSS-based hiding to reduce visual flashes during navigation

---

## 🚀 Quick Start

### Install (unpacked)

1. Download or clone this repository

**Chrome**
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `extension/` folder

**Microsoft Edge**
2. Open `edge://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `extension/` folder

---

## 🧩 Usage

Open a YouTube video, then click the BetterYoutube extension icon.

- **PiP**: use the popup button, or the in-player PiP control
- **Scrolling**: enable/disable Better Scrolling in the popup
- **Speed**: configure step + keybindings in the popup, then use the shortcuts on YouTube
- **SponsorBlock**: toggle auto-skip in the popup
- **Focus Mode**: enable Focus Mode, then choose what to hide

---

## 🔐 Permissions

BetterYoutube requests only what it needs:

- `https://www.youtube.com/*` — injects UI/behavior changes on YouTube pages
- `https://sponsor.ajay.app/*` — fetches SponsorBlock skip segments
- `storage` — saves your settings
- `activeTab` + `scripting` — runs popup-triggered actions on the current tab

---

## 🤝 Contributing

Issues and pull requests are welcome.

---