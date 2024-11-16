export $(grep -v '^#' .env | xargs -d '\n')
export $(grep -v '^#' .env-secret | xargs -d '\n')

forge --version
if [ $? != 0 ]; then
    export PATH="$PATH:~/.foundry/bin"
    forge --version
    if [ $? != 0 ]; then
        echo "forge is not installed, please install first"
        exit 2
    fi
fi

if [[ $RPC_URL == "" ]]; then
    echo "set RPC_URL in .env file before use this program"
    exit 3
fi

if [[ $PRIVATE_KEY == "" ]]; then
    PRIVATE_KEY=0x9efffc1c6cf429d71991ae1ef184feded045bb8eda43bbfba7b8d413aa559e39
    # echo "set PRIVATE_KEY in .env-secret file before use this program"
    # exit 4
fi

set -e

output=$(forge create contracts/LayoutEligibilityVerifier.sol:Groth16LayoutEligibilityVerifier \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --legacy | tee /dev/tty)
echo $output

layoutAddress=$(echo "$output" | grep "Deployed to:"  | awk -F ': ' '{print $2}')

echo -e "Layout Address: \e[34m$layoutAddress\e[0m"

output=$(forge create contracts/Game.sol:Game \
    --constructor-args $layoutAddress 1 6 10 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --legacy | tee /dev/tty)

echo $output

gameAddress=$(echo "$output" | grep "Deployed to:"  | awk -F ': ' '{print $2}')

echo -e "Game Address: \e[34m$gameAddress\e[0m"
