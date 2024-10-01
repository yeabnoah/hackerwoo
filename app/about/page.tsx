import React from 'react';
import Image from 'next/image';
import { FiGithub, FiLinkedin, FiMail, FiSend, FiGlobe } from 'react-icons/fi';
import { RiTwitterXFill } from 'react-icons/ri';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32">
      <div className="container mx-auto py-8 sm:py-12">
        <div className="bg-card rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-primary">Hi, I&apos;m Yeabsra! 👋</h1>
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <Image
              src="https://i.ibb.co/3Cc24n1/tech.jpg"
              alt="Yeabsra&apos;s profile picture"
              width={200}
              height={200}
              className="rounded-full hover:rotate-12 transition-transform duration-300 w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-foreground">Yeabsra Ashebir [ Tech Nerd ]</h2>
              <p className="mb-4 text-foreground text-sm sm:text-base">
                Hello! I&apos;m Yeabsra, a web developer from Ethiopia. I love turning ideas into great websites and apps.
              </p>
              <p className="mb-4 text-foreground text-sm sm:text-base">
                When I&apos;m not coding, I like to learn about new tech. I&apos;m good at finding small details and solving tricky problems.
              </p>
              <p className="mb-4 text-foreground text-sm sm:text-base">
                Want to work together on a cool project? I&apos;m always ready to start a new coding project. Let&apos;s make something amazing!
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <SocialLink href="https://x.com/technerd556" icon={<RiTwitterXFill />} label="my x acc" />
                <SocialLink href="https://github.com/yeabnoah" icon={<FiGithub />} label="My GitHub" />
                <SocialLink href="https://www.linkedin.com/in/yeabsra-ashebir-tech-nerd-8a3a80267/" icon={<FiLinkedin />} label="LinkedIn" />
                <SocialLink href="mailto:yeabnoah5@gmail.com" icon={<FiMail />} label="Email Me" />
                <SocialLink href="https://t.me/technerd345" icon={<FiSend />} label="Telegram" />
                <SocialLink href="https://technerd.vercel.app" icon={<FiGlobe />} label="My Website" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SocialLink: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-primary hover:text-primary-foreground transition-colors duration-200 flex items-center group text-sm sm:text-base"
  >
    <span className="mr-2 group-hover:animate-bounce">{icon}</span>
    <span className="group-hover:underline">{label}</span>
  </a>
);

export default AboutPage;
