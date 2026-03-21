import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View style={styles.tab}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                // Define icons based on route name
                let iconName = 'help-outline';
                switch (route.name) {
                    case 'Home':
                        iconName = 'home-outline';
                        if (isFocused) iconName = 'home';
                        break;
                    case 'SearchHelper':
                        iconName = 'search-outline';
                        if (isFocused) iconName = 'search';
                        break;
                    case 'QuickJobPost':
                        iconName = 'add-circle-outline';
                        if (isFocused) iconName = 'add-circle';
                        break;
                    case 'MarkAttendance':
                        iconName = 'menu-outline';
                        if (isFocused) iconName = 'menu';
                        break;
                    case 'ProfileWallet':
                        iconName = 'person-outline';
                        if (isFocused) iconName = 'person';
                        break;
                }

                return (
                    <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={styles.tabItem}
                    >
                        {/* Active Indicator could be a View wrapping the icon or just color change */}
                        {/* Matching existing design: Icon color changes, or maybe a background circle for active? 
                 Looking at homescreen.tsx, it was just color change: #FF9F1C vs #999.
                 But searchWorker.tsx had a background circle for active. 
                 Let's go with just color for now to be safe, or try to mimic the "Active View" if desired.
                 Wait, searchWorker.tsx line 61 has:
                 <View style={styles.tabActive}><Icon ... /></View>
                 Tab active style: backgroundColor: '#FF9F1C', borderRadius: 50, marginTop: -20
                 Let's implement that visual pop for the focused item.
             */}
                        {isFocused ? (
                            <View style={styles.tabActive}>
                                <Icon name={iconName} size={24} color="#FFF" />
                            </View>
                        ) : (
                            <Icon name={iconName} size={24} color="#999" />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    tab: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: '#EEE',
        backgroundColor: '#FFF',
        // Ensure it sits at bottom nicely
        height: 70,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    tabActive: {
        backgroundColor: '#FF9F1C',
        padding: 12,
        borderRadius: 50,
        marginTop: -20, // Pop up effect
        elevation: 4,
        shadowColor: '#FF9F1C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});
