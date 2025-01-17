import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FishSymbol, Leaf, Heart, Info, Droplet, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className='container mx-auto px-4 py-8'>
      <h1 className='text-4xl font-bold mb-6'>About The Catch Chronicles</h1>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Info className='mr-2' />
            Purpose and Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-4'>
            The Catch Chronicles is your digital companion for recording and
            cherishing your fly fishing adventures. Our application is designed
            to help anglers of all levels track their fishing trips, learn from
            their experiences, and contribute to fish conservation efforts.
          </p>
          <ul className='list-disc pl-6'>
            <li>Log detailed information about your fishing trips</li>
            <li>
              Track locations, fish species caught, and weather conditions
            </li>
            <li>Upload and store photos of your catches</li>
            <li>Analyze your fishing patterns and improve your skills</li>
            <li>Connect with a community of responsible anglers</li>
          </ul>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <FishSymbol className='mr-2' />
            Catch and Release
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-4'>
            Catch and release is a practice aimed at conservation. It allows
            fish to be caught for recreation, but released back into the water
            unharmed. This practice helps maintain fish populations and
            preserves the thrill of fishing for future generations.
          </p>
          <p>
            When practiced correctly, catch and release can have minimal impact
            on fish populations. However, it's crucial to handle fish properly
            to ensure their survival after release.
          </p>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Heart className='mr-2' />
            The Importance of Fish Conservation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='mb-4'>
            Fish play a vital role in aquatic ecosystems and are important
            indicators of water quality. Conservation efforts help maintain
            biodiversity, protect endangered species, and ensure the
            sustainability of recreational fishing.
          </p>
          <p>
            By practicing responsible fishing and supporting conservation
            efforts, we can help preserve these valuable resources for future
            generations to enjoy.
          </p>
        </CardContent>
      </Card>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Droplet className='mr-2' />
            Tips for Proper Fish Handling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='list-disc pl-6'>
            <li>
              Wet your hands before handling fish to protect their slime coat
            </li>
            <li>
              Use barbless hooks to minimize injury and make release easier
            </li>
            <li>
              Keep fish in the water as much as possible during unhooking and
              photography
            </li>
            <li>Support the fish's body horizontally and avoid squeezing</li>
            <li>
              Use rubber or knotless nets to reduce damage to the fish's scales
              and fins
            </li>
            <li>
              Revive the fish in the current before release, ensuring it can
              swim away on its own
            </li>
            <li>
              Avoid fishing in high water temperatures when fish are more
              stressed
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Users className='mr-2' />
            Ways to Contribute to Fish Preservation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className='list-disc pl-6'>
            <li>Join or donate to local conservation organizations</li>
            <li>Participate in river and shoreline cleanup events</li>
            <li>
              Report pollution or illegal fishing activities to authorities
            </li>
            <li>Educate others about responsible fishing practices</li>
            <li>Support habitat restoration projects</li>
            <li>Practice and promote catch and release</li>
            <li>
              Volunteer for fish population surveys or habitat improvement
              projects
            </li>
            <li>
              Reduce your use of single-use plastics to prevent water pollution
            </li>
            <li>
              Stay informed about local fishing regulations and respect them
            </li>
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
