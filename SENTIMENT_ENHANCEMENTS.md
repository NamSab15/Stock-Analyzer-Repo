# Sentiment Enhancements Roadmap

The backend now supports a multi-source, multi-model sentiment pipeline together with personalization, alerts, and validation primitives. This document highlights the moving pieces so you can configure, extend, and monitor the new capabilities.

## 1. Expanded Data Sources

| Source Type | Provider | Env Requirements | Notes |
|-------------|----------|------------------|-------|
| News | MoneyControl, Economic Times, Google News | none | Existing scrapers remain; deduplication now uses `externalId` (article URL). |
| Social Media | Twitter/X Recent Search | `TWITTER_BEARER_TOKEN` | Fetches 20 most recent English tweets mentioning the company. |
| Community | Reddit Search API | none | Pulls the latest 15 posts mentioning the company ticker/brand. |
| Transcripts | Financial Modeling Prep | `FMP_API_KEY` | Retrieves most recent earnings-call transcript snippets. |
| Analyst/Research | Alpha Vantage News Sentiment | `ALPHA_VANTAGE_API_KEY` | Surfaces analyst reports with ticker-level sentiment metadata. |
| NLP Ensemble | Hugging Face FinBERT | `HUGGINGFACE_API_KEY` (optional) | Adds Transformer-based sentiment if the key is present; falls back silently otherwise. |

All connectors degrade gracefully when credentials are missing or providers throttle. Errors are logged but do not block other sources.

## 2. Ensemble Sentiment Models

`backend/services/sentimentAnalyzers.js` blends:

- Lexicon-based Sentiment (AFINN)
- VADER polarity scores
- Domain keyword heuristics
- FinBERT transformer (optional)

Each model contributes a weighted score, confidence, and feature breakdown. These details are persisted per sentiment document (`modelBreakdown`, `confidence`, `signals`).

## 3. Storage & History

`Sentiment` documents now carry:

- `sourceType`, `provider`, `externalId`
- Confidence + quality metrics
- Structured `signals` extracted from text (upgrades, downgrades, regulatory risk, etc.)

`SentimentAggregate` stores hourly rollups with mention counts, source breakdowns, and average confidence. `GET /api/sentiment/:symbol/history` now returns these richer snapshots instead of raw aggregations.

## 4. Confidence & Filtering

`GET /api/sentiment/:symbol/news?sourceType=social,news&minConfidence=0.6` lets the frontend filter sentiment cards by provenance or consensus confidence. API responses include `avgConfidence`, `freshnessMinutes`, and `latestSignals` for UI cues.

## 5. Alerting Workflow

New Mongo models: `AlertRule` + `AlertEvent`. Use `/api/alerts` (authenticated) to create rules such as “alert me when RELIANCE sentiment drops below -0.3 with at least 5 mentions.”

Alert evaluations run every global sentiment sweep and support email/webhook/in-app channels (webhook delivery implemented, others stubbed via `AlertEvent`).

## 6. User Personalization

The `User` model stores `sentimentPreferences` (preferred sources, min confidence, thresholds, channel settings). Auth routes now return these preferences and expose:

- `GET /api/auth/preferences/sentiment`
- `PUT /api/auth/preferences/sentiment`

Use them on the frontend to tailor watchlists, highlight risky tickers, or pre-fill alert forms.

## 7. Prediction Validation

Every prediction issued by `generatePrediction` is logged in `PredictionAudit`. An hourly validator compares predicted vs. actual price moves once the horizon elapses. This enables accuracy dashboards and automatic retraining triggers later.

## 8. Data Ingestion Reliability

`stockService` gained:

- Bottleneck-based rate limiting
- `p-retry` with jittered retries
- 10-second result caching per symbol
- Provider health telemetry (`getDataProviderHealth`)

Updates will log provider failures and prevent cascading outages when Yahoo throttles.

## 9. Configuration Checklist

Add the following to `.env` as needed:

```
TWITTER_BEARER_TOKEN=...
FMP_API_KEY=...
ALPHA_VANTAGE_API_KEY=...
HUGGINGFACE_API_KEY=...
ENABLE_SENTIMENT_CRON=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false # true for 465
SMTP_USER=username
SMTP_PASS=password
EMAIL_FROM=no-reply@yourdomain.com
```

## 10. Next Steps

1. **Frontend surfacing**: show confidence meters, source pills, and signals on the sentiment cards.
2. **Notification delivery**: email notifications are supported via SMTP (nodemailer). Configure SMTP-related env variables above and create AlertRules (via `/api/alerts`) for email notifications. Webhooks and in-app events remain supported.
3. **Model monitoring**: expose `PredictionAudit` aggregates to track hit/miss ratios per ticker.
4. **Source weights per user**: blend preferences from `sentimentPreferences` into the API queries.

Feel free to expand this document as you wire up the UI/ops workflows.
