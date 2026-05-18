import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.barnesbowlingclub.co.uk';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const publicRoutes = [
    { url: `${BASE_URL}/`,                                                    priority: 1.0,  changeFrequency: 'monthly'  },
    { url: `${BASE_URL}/history`,                                             priority: 0.7,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/how-to-play`,                                         priority: 0.6,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/opening-hours`,                                       priority: 0.7,  changeFrequency: 'monthly'  },
    { url: `${BASE_URL}/contact`,                                             priority: 0.7,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/roll-ups`,                                            priority: 0.8,  changeFrequency: 'monthly'  },
    { url: `${BASE_URL}/events`,                                              priority: 0.9,  changeFrequency: 'weekly'   },
    { url: `${BASE_URL}/membership`,                                          priority: 0.9,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/apply`,                                               priority: 0.8,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/membership-application`,                              priority: 0.6,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/news`,                                                priority: 0.8,  changeFrequency: 'weekly'   },
    { url: `${BASE_URL}/newsletter`,                                          priority: 0.7,  changeFrequency: 'monthly'  },
    { url: `${BASE_URL}/notices`,                                             priority: 0.6,  changeFrequency: 'weekly'   },
    { url: `${BASE_URL}/gallery`,                                             priority: 0.6,  changeFrequency: 'monthly'  },
    { url: `${BASE_URL}/community`,                                           priority: 0.6,  changeFrequency: 'monthly'  },
    { url: `${BASE_URL}/community/fish-open-gardens`,                         priority: 0.5,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/community/official-sport-of-darwin-200`,              priority: 0.5,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/community/supporting-barnes-artists`,                 priority: 0.5,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/community/supporting-the-oso`,                        priority: 0.5,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/general-committee`,                                   priority: 0.5,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/handicap-committee`,                                  priority: 0.5,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/privacy-policy`,                                      priority: 0.3,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/social-media-policy`,                                 priority: 0.3,  changeFrequency: 'yearly'   },
    { url: `${BASE_URL}/sitemap`,                                             priority: 0.3,  changeFrequency: 'monthly'  },
  ].map((r) => ({ ...r, lastModified: now })) as MetadataRoute.Sitemap;

  return publicRoutes;
}
