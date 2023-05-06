# Google Calendar Event Notifier App

| DailyEvents | UpcomingEvents |
|--------|--------|
| <img width="231" alt="SCR-20230506-tpht-2" src="https://user-images.githubusercontent.com/12729025/236627901-f526ed0b-146f-49a7-89ca-b199b91c7424.png"> | <img width="231" alt="SCR-20230506-tpve-2" src="https://user-images.githubusercontent.com/12729025/236627883-889fe37f-ad97-4c18-9502-bb5b108a0a02.png"> |

これは[new Slack platform](https://api.slack.com/automation)と[Google Calendar API](https://developers.google.com/calendar/api/guides/overview?hl=en)を利用し、カレンダーイベントを取得しSlackチャンネルに通知するSlackアプリです。

元々、チームの共有カレンダーをSlackの任意チャンネルに通知するアプリとして[Slack 向け Google Calendar for Team Events](https://slack.com/intl/ja-jp/help/articles/360047938054-Slack-%E5%90%91%E3%81%91-Google-Calendar-for-Team-Events)が存在していましたが、近々廃止予定のため、new Slack platformで代替アプリとして作ってみたのが背景です。ちなみに、上記アプリを既にインストールしている場合はそのまま使えますが、新規での追加はできません（いずれにしてもメンテナンス外なので利用は非推奨）。

**Features**:

本レポジトリの機能は2点です。

- **特定の時間（デフォルト 9:00 AM）に1日のイベントのサマリーを特定チャンネルに通知する**
  - `today_events_function.ts`
  - Scheduled Triggerを利用して平日の午前9:00に毎日発火する
- **イベントの開始直前（デフォルト 15分前）にイベントを特定チャンネルに通知する**
  - new Slack PlatformのScheduled Triggerは、最も短くて1時間単位のためバッチでの処理はできない
  - 代わりにWebhook Triggerがあるので、[IFTTT](https://ifttt.com/)や[Zapier](https://zapier.com/)、[Cloud Schedular](https://cloud.google.com/scheduler?hl=ja)などを使って外部で15分クローンを作成しWebhookとして叩くのが現実的です
    - ちなみにIFTTTやZapierを使えば15分前きっちりに通知の受信およびイベント取得ができるらしいので、カレンダー内容を上記のSaaSに渡しても問題ないポリシーであれば利用すると楽に済みます。

---

## Setup

- Set up Slack CLI
  - ref. [Quickstart guide for modular Slack apps | Slack](https://api.slack.com/automation/quickstart)
- Google Cloud にて OAuthウェブクライアントを作成する
  - ref. https://support.google.com/workspacemigrate/answer/9222992?hl=ja

## Env

```sh
❯ slack --version
Using slack v2.1.0
```

## Local Development

### Create `.env` on root directory

- Local Developmentでは`.env`を自動で読み込んでくれるので特別なセットアップは不要（デプロイ時には`add`が必要）
- ref. [Environment variables | Slack](https://api.slack.com/automation/environment-variables)

```sh
❯ touch .env

# CALENDAR_ID="[YOUR_CALENDAR_ID]"
# SLACK_CHANNEL_ID="[YOUR_POST_CHANNEL]"
```

### Replace `client_id` in `manifest.ts`

https://github.com/HTsuruo/google-calendar-event-notifier-app/blob/c5f73c9b11e87659108631596647ec9aa5f12fac/manifest.ts#L12

### Store OAuth secret key to Slack platform

- Slackプラットフォームに保存することで露呈することなくセキュアに取り扱うことができる
  - OAuthの認証もプラットフォーム側で完結するので、一度認証を済ませればアクセストークンが取得できた状態で開発できる
  - ref. https://api.slack.com/automation/external-auth#client-secret

```sh
❯ slack external-auth add-secret --provider google --secret "GOCSPX-abc123..."
❯ slack external-auth add
```

### Crate Trigger

```sh
# 本日のイベントを全て通知する用トリガー
❯ slack trigger create --trigger-def triggers/daily_morining_trigger.ts

# イベントの開始直前に通知される用のトリガー
❯ slack trigger create --trigger-def triggers/upcoming_minutes_trigger.ts
```

### How to Run

```sh
❯ slack run
```

## Deploy Setup

```sh
# 環境変数をSlackプラットフォームに設定する（.envはデプロイ環境では読み込まれない）
❯ slack env add MY_ENV_VAR "asdf-1234"`

# デプロイ環境でも同様にシークレットキーを保存する（環境ごとに設定が必要）
❯ slack external-auth add-secret --provider google --secret "GOCSPX-abc123..."
❯ slack external-auth add

# トリガーの設定も環境ごとに必要
❯ slack trigger create --trigger-def triggers/daily_morining_trigger.ts
❯ slack trigger create --trigger-def triggers/upcoming_minutes_trigger.ts

# デプロイ
❯ slack deploy
```
