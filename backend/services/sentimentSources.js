const axios = require('axios');

function sanitizeSymbol(symbol) {
  return symbol.replace('.NS', '').replace('.BO', '').toUpperCase();
}

async function fetchTwitterMentions(symbol, companyName) {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    return [];
  }

  try {
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      params: {
        query: `${companyName} (stock OR shares OR results) lang:en -is:retweet`,
        'tweet.fields': 'author_id,created_at,lang,public_metrics',
        max_results: 20,
      },
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      timeout: 5000,
    });

    return (response.data.data || []).map(tweet => ({
      id: tweet.id,
      title: `Tweet by ${tweet.author_id}`,
      text: tweet.text,
      url: `https://twitter.com/i/web/status/${tweet.id}`,
      source: 'twitter',
      sourceType: 'social',
      provider: 'twitter',
      publishedAt: new Date(tweet.created_at),
      metadata: {
        authorId: tweet.author_id,
        language: tweet.lang,
        metrics: tweet.public_metrics,
      },
    }));
  } catch (error) {
    console.warn(`Twitter fetch failed for ${symbol}:`, error.message);
    return [];
  }
}

async function fetchRedditMentions(companyName) {
  try {
    const response = await axios.get('https://www.reddit.com/search.json', {
      params: {
        q: `${companyName} stock`,
        limit: 15,
        sort: 'new',
        restrict_sr: false,
      },
      timeout: 5000,
    });

    const posts = response.data?.data?.children || [];
    return posts.map(post => ({
      id: post.data.id,
      title: post.data.title,
      text: post.data.selftext || post.data.title,
      url: `https://www.reddit.com${post.data.permalink}`,
      source: 'reddit',
      sourceType: 'social',
      provider: 'reddit',
      publishedAt: new Date(post.data.created_utc * 1000),
      metadata: {
        subreddit: post.data.subreddit,
        score: post.data.score,
        num_comments: post.data.num_comments,
      },
    }));
  } catch (error) {
    console.warn(`Reddit fetch failed for ${companyName}:`, error.message);
    return [];
  }
}

async function fetchEarningsTranscripts(symbol) {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return [];
  }

  const cleanSymbol = sanitizeSymbol(symbol);

  try {
    const url = `https://financialmodelingprep.com/api/v3/earning_call_transcript/${cleanSymbol}?period=quarter&apikey=${apiKey}`;
    const response = await axios.get(url, { timeout: 7000 });
    const transcripts = response.data || [];

    return transcripts.slice(0, 5).map(item => ({
      id: item.id || `${cleanSymbol}-${item.date}`,
      title: `${cleanSymbol} Earnings Call (${item.quarter || 'recent'})`,
      text: item.content?.slice(0, 4000) || '',
      url: item.pdfLink,
      source: 'earnings_call',
      sourceType: 'transcript',
      provider: 'financialmodelingprep',
      publishedAt: new Date(item.date || Date.now()),
      metadata: {
        quarter: item.quarter,
        year: item.year,
      },
    }));
  } catch (error) {
    console.warn(`Transcript fetch failed for ${symbol}:`, error.message);
    return [];
  }
}

async function fetchAnalystReports(symbol) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return [];
  }

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: sanitizeSymbol(symbol),
        apikey: apiKey,
      },
      timeout: 7000,
    });

    const feed = response.data?.feed || [];
    return feed.slice(0, 10).map(item => ({
      id: item.url,
      title: item.title,
      text: item.summary,
      url: item.url,
      source: 'analyst_report',
      sourceType: 'analyst',
      provider: item.source,
      publishedAt: new Date(item.time_published || Date.now()),
      metadata: {
        authors: item.authors,
        topics: item.topics,
        ticker_sentiment: item.ticker_sentiment,
      },
    }));
  } catch (error) {
    console.warn(`Analyst report fetch failed for ${symbol}:`, error.message);
    return [];
  }
}

async function fetchExtendedSentimentSources(symbol, companyName) {
  const [twitter, reddit, transcripts, analystReports] = await Promise.all([
    fetchTwitterMentions(symbol, companyName),
    fetchRedditMentions(companyName),
    fetchEarningsTranscripts(symbol),
    fetchAnalystReports(symbol),
  ]);

  return [
    ...twitter,
    ...reddit,
    ...transcripts,
    ...analystReports,
  ];
}

module.exports = {
  fetchExtendedSentimentSources,
  fetchTwitterMentions,
  fetchRedditMentions,
  fetchEarningsTranscripts,
  fetchAnalystReports,
};
