import hashlib
import time


class Block:
    def __init__(self, index, data, previous_hash):
        self.index = index
        self.timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        self.data = data
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        content = f"{self.index}{self.timestamp}{self.data}{self.previous_hash}"
        return hashlib.sha256(content.encode()).hexdigest()

    def __repr__(self):
        return (
            f"\n{'='*60}\n"
            f"  Block #{self.index}\n"
            f"{'='*60}\n"
            f"  Timestamp     : {self.timestamp}\n"
            f"  Data          : {self.data}\n"
            f"  Previous Hash : {self.previous_hash[:20]}...\n"
            f"  Hash          : {self.hash[:20]}...\n"
        )


class Blockchain:
    def __init__(self):
        self.chain = [self._create_genesis_block()]

    def _create_genesis_block(self):
        return Block(0, "Genesis Block", "0" * 64)

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, data):
        previous_hash = self.get_latest_block().hash
        new_block = Block(len(self.chain), data, previous_hash)
        self.chain.append(new_block)
        print(f"  Block #{new_block.index} added successfully.")

    def is_valid(self):
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            if current.hash != current.calculate_hash():
                print(f"  Block #{current.index} has been tampered with!")
                return False

            if current.previous_hash != previous.hash:
                print(f"  Block #{current.index} is not linked correctly!")
                return False
        return True

    def display(self):
        print("\n" + "~" * 60)
        print("  🔗  BLOCKCHAIN LEDGER")
        print("~" * 60)
        for block in self.chain:
            print(block)
        print("~" * 60 + "\n")


# --- Demo ---
if __name__ == "__main__":
    bc = Blockchain()

    print("\nAdding blocks to the chain...")
    bc.add_block("Alice sends 10 BTC to Bob")
    bc.add_block("Bob sends 3 BTC to Carol")
    bc.add_block("Carol sends 1 BTC to Dave")

    bc.display()

    # Validate
    print("Chain integrity check:", "✅ Valid" if bc.is_valid() else "❌ Invalid")

    # Tamper with a block
    print("\nTampering with Block #1...")
    bc.chain[1].data = "Alice sends 999 BTC to Eve"
    # Note: hash is NOT recalculated — this breaks the chain

    print("Chain integrity check:", "✅ Valid" if bc.is_valid() else "❌ Invalid")
