import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'
import ChatWidget from '../components/ChatWidget'
import { SUPPORT } from '../lib/support.config'

export default function App({ Component, pageProps }: AppProps) {
  return       <><Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="JSONSchema" />
        <meta property="og:description" content="JSONSchema turns a sample JSON object into a JSON Schema (draft 2020-12), explains each required field, and screens it with a deterministic compliance ruleset (type/required/format/enum). Export the schema your API can enforce." />
        <meta property="og:url" content="https://jsonschema.lxsaihub.com/" />
        <meta property="og:image" content="https://jsonschema.lxsaihub.com/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JSONSchema" />
        <meta name="twitter:description" content="JSONSchema turns a sample JSON object into a JSON Schema (draft 2020-12), explains each required field, and screens it with a deterministic compliance ruleset (type/required/format/enum). Export the schema your API can enforce." />
        <meta name="twitter:image" content="https://jsonschema.lxsaihub.com/og.png" />
                                        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: '{"@context":"https://schema.org","@type":"SoftwareApplication","name":"JSONSchema","url":"https://jsonschema.lxsaihub.com/","description":"JSONSchema turns a sample JSON object into a JSON Schema (draft 2020-12), explains each required field, and screens it with a deterministic compliance ruleset (type/required/format/enum). Export the schema your API can enforce.","applicationCategory":"BusinessApplication","operatingSystem":"Web","offers":{"@type":"Offer","priceCurrency":"USD","price":"0","availability":"https://schema.org/OnlineOnly"}}' }} />
      </Head>
      <Component {...pageProps} />
      <ChatWidget productName={SUPPORT.productName} brandColor={SUPPORT.brandColor} sessionKeyPrefix={SUPPORT.productSlug} /></>
}
