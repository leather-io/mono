import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// DEMO AI GENERATED COMPONENT
interface AccountCardProps {
  accountName: string;
  bnsNameOrAddress: string;
  balance: string;
}

export function AccountCard({ accountName, bnsNameOrAddress, balance }: AccountCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✨</Text>
        </View>
        <View style={styles.ledgerContainer}>
          <Text style={styles.ledgerText}>Ledger</Text>
        </View>
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.leftColumn}>
          <Text style={styles.accountName}>{accountName}</Text>
          <Text style={styles.bnsNameOrAddress}>{bnsNameOrAddress}</Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={styles.balance}>{balance}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    shadowRadius: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: 'black',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    color: 'white',
    fontSize: 16,
  },
  ledgerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 4,
  },
  ledgerText: {
    color: '#888',
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bnsNameOrAddress: {
    color: '#888',
    fontSize: 14,
  },
  balance: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
