import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | The Catch Chronicles',
  description:
    'Privacy Policy for The Catch Chronicles fishing trip logger application',
};

export default function PrivacyPolicyPage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-6'>Privacy Policy</h1>
      <p className='mb-4'>Last updated: {new Date().toLocaleDateString()}</p>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-3'>1. Introduction</h2>
        <p>
          Welcome to The Catch Chronicles (&quot;we,&quot; &quot;our,&quot; or
          &quot;us&quot;). We are committed to protecting your personal
          information and your right to privacy. This Privacy Policy explains
          how we collect, use, disclose, and safeguard your information when you
          use our fishing trip logger application.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-3'>
          2. Information We Collect
        </h2>
        <p>We collect information that you provide directly to us when you:</p>
        <ul className='list-disc list-inside ml-4'>
          <li>Create an account</li>
          <li>Log fishing trips</li>
          <li>Upload photos</li>
          <li>Use our application features</li>
        </ul>
        <p className='mt-2'>
          This information may include your name, email address, fishing trip
          details, and any other information you choose to provide.
        </p>
        <p className='mt-2'>
          We also use strictly essential cookies to maintain your authenticated
          session and provide access to the app&apos;s features. These cookies
          do not collect any personal information beyond what is necessary for
          the app&apos;s basic functionality.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-3'>
          3. How We Use Your Information
        </h2>
        <p>We use the information we collect to:</p>
        <ul className='list-disc list-inside ml-4'>
          <li>Provide, maintain, and improve our services</li>
          <li>Authenticate your account and maintain your logged-in session</li>
        </ul>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-3'>4. Cookies</h2>
        <p>
          We use strictly essential cookies in our application. These cookies
          are necessary for the app to function properly and cannot be switched
          off in our systems. They are usually only set in response to actions
          made by you which amount to a request for services, such as logging in
          or filling in forms.
        </p>
        <p className='mt-2'>Our strictly essential cookies are used for:</p>
        <ul className='list-disc list-inside ml-4'>
          <li>Keeping you signed in</li>
          <li>Ensuring the security of your account</li>
        </ul>
        <p className='mt-2'>
          You can set your browser to block or alert you about these cookies,
          but some parts of the site will then not work. These cookies do not
          store any personally identifiable information.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-3'>
          5. Sharing of Information
        </h2>
        <p>
          We do not sell or rent your personal information to third parties. We
          may share your information in the following situations:
        </p>
        <ul className='list-disc list-inside ml-4'>
          <li>With your consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and prevent fraud or abuse</li>
        </ul>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-3'>6. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal information against unauthorized or unlawful
          processing, accidental loss, destruction, or damage.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-3'>7. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal
          information. You can do this through your account settings or by
          contacting us directly.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-3'>
          8. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last updated&quot; date.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-3'>9. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at:
        </p>
        <p>Email: martinbolsones@gmail.com</p>
      </section>
    </div>
  );
}
