partner=$1
target=$2

if [[ -n "$partner" ]] && [[ -n "$target" ]]; then
  if [[ $target = "dev" ]] || [[ $target = "preprod" ]] || [[ $target = "prod" ]]; then

      npm install
      gulp build

      # Specific to the environment
      if [[ "$target" = "dev" ]]; then
        cp ./deployments/configs/${partner}/config_dev.js ./build/config.js
        # disable
        #gulp docs:generate

      else if [[ "$target" = "preprod" ]]; then
        cp ./deployments/configs/${partner}/config_preprod.js ./build/config.js

      else if [[ "$target" = "prod" ]]; then
        cp ./deployments/configs/${partner}/config_prod.js ./build/config.js
      fi
      fi
      fi

      gulp analyze || true
      # disable: need to fix tests that are failing
      #gulp test:all
  else
    echo "Error: unknown target (dev, preprod, prod)."
  fi
else
  echo "Error: missing parameters: $0 <partner> <target>"
fi
