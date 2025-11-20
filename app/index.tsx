/**
 * Index/Landing Screen
 * Redirect to forum tab when app starts
 */

import { Redirect } from 'expo-router';

export default function Index() {
     return <Redirect href="/(tabs)/forum" />;
}
